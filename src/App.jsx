import { useState, useCallback, useMemo } from 'react';
import './App.css';
import CodeEditor from './components/CodeEditor';
import KarelWorld from './components/KarelWorld';
import StatusPanel, { StatusType } from './components/StatusPanel';
import { assignments } from './data/assignments';
import { parseWorld, interpretKarelCode, compareWorlds, cloneWorld } from './utils/karelInterpreter';

function App() {
  // Current selected assignment
  const [currentAssignmentId, setCurrentAssignmentId] = useState(assignments[0]?.id);

  // User's code for each assignment
  const [userCodes, setUserCodes] = useState(() => {
    const initial = {};
    assignments.forEach(a => {
      initial[a.id] = a.starterCode;
    });
    return initial;
  });

  // Completion status for each assignment
  const [completedAssignments, setCompletedAssignments] = useState({});

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState(StatusType.IDLE);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusDetails, setStatusDetails] = useState('');

  // World state
  const [currentWorld, setCurrentWorld] = useState(null);

  // Hints visibility
  const [showHints, setShowHints] = useState(false);

  // Get current assignment
  const currentAssignment = useMemo(() =>
    assignments.find(a => a.id === currentAssignmentId),
    [currentAssignmentId]
  );

  // Parse initial world
  const initialWorld = useMemo(() => {
    if (!currentAssignment) return null;
    try {
      return parseWorld(currentAssignment.world);
    } catch (e) {
      console.error('Failed to parse world:', e);
      return null;
    }
  }, [currentAssignment]);

  // Parse expected world
  const expectedWorld = useMemo(() => {
    if (!currentAssignment) return null;
    try {
      return parseWorld(currentAssignment.expectedWorld);
    } catch (e) {
      console.error('Failed to parse expected world:', e);
      return null;
    }
  }, [currentAssignment]);

  // Initialize world when assignment changes
  useMemo(() => {
    if (initialWorld) {
      setCurrentWorld(cloneWorld(initialWorld));
      setStatus(StatusType.IDLE);
      setStatusMessage('');
      setStatusDetails('');
      setShowHints(false);
    }
  }, [initialWorld]);

  // Handle code change
  const handleCodeChange = useCallback((newCode) => {
    setUserCodes(prev => ({
      ...prev,
      [currentAssignmentId]: newCode
    }));
  }, [currentAssignmentId]);

  // Reset world to initial state
  const handleReset = useCallback(() => {
    if (initialWorld) {
      setCurrentWorld(cloneWorld(initialWorld));
      setStatus(StatusType.IDLE);
      setStatusMessage('');
      setStatusDetails('');
    }
  }, [initialWorld]);

  // Animation speed (1-100)
  const [animationSpeed, setAnimationSpeed] = useState(50);

  // Run the user's code
  const handleRun = useCallback(async () => {
    if (!initialWorld || isRunning) return;

    setIsRunning(true);
    setStatus(StatusType.RUNNING);
    setStatusMessage('კოდი მუშავდება...');

    // Reset to initial world first
    const startWorld = cloneWorld(initialWorld);
    setCurrentWorld(startWorld);

    // Small delay to show reset
    await new Promise(resolve => setTimeout(resolve, 100));

    const code = userCodes[currentAssignmentId] || '';

    try {
      let executedSteps = [];
      let executionError = null;

      // Try to execute with step capture
      try {
        const result = interpretKarelCode(code, startWorld);
        executedSteps = result.steps;
      } catch (error) {
        // If execution failed, try to get partial steps
        executionError = error;

        // Try to execute step by step to capture what was done
        try {
          const partialResult = interpretKarelCode(
            code,
            startWorld,
            (world, command) => {
              executedSteps.push({ command, world: cloneWorld(world) });
            }
          );
        } catch (e) {
          // Steps were captured via callback
        }
      }

      // Calculate delay based on speed (invert: high speed = low delay)
      const delay = Math.max(10, 500 - (animationSpeed * 4.5));

      // Animate through captured steps
      for (let i = 0; i < executedSteps.length; i++) {
        const step = executedSteps[i];
        await new Promise(resolve => setTimeout(resolve, delay));
        setCurrentWorld(step.world);
      }

      // If there was an error, show it after animation
      if (executionError) {
        setStatus(StatusType.ERROR);
        setStatusMessage(executionError.message);
        setStatusDetails('');
      } else {
        // Check if result matches expected
        const finalWorld = executedSteps.length > 0
          ? executedSteps[executedSteps.length - 1].world
          : startWorld;

        if (expectedWorld && compareWorlds(finalWorld, expectedWorld)) {
          setStatus(StatusType.SUCCESS);
          setStatusMessage('დავალება წარმატებით შესრულდა!');
          setStatusDetails('');
          setCompletedAssignments(prev => ({
            ...prev,
            [currentAssignmentId]: true
          }));
        } else {
          setStatus(StatusType.ERROR);
          setStatusMessage('კარელი არ მივიდა სწორ პოზიციაზე ან ბიპერები არასწორადაა განლაგებული.');
          setStatusDetails('შეამოწმეთ თქვენი კოდი და სცადეთ თავიდან.');
        }
      }

    } catch (error) {
      setStatus(StatusType.ERROR);
      setStatusMessage(error.message);
      setStatusDetails('');
    } finally {
      setIsRunning(false);
    }
  }, [initialWorld, expectedWorld, userCodes, currentAssignmentId, isRunning, animationSpeed]);

  // Select assignment
  const handleSelectAssignment = useCallback((id) => {
    setCurrentAssignmentId(id);
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🤖</div>
            <div className="sidebar-logo-text">
              <h1>Karel IDE</h1>
              <span>Stanford CS106A</span>
            </div>
          </div>
        </div>
        <div className="sidebar-content">
          <div className="assignment-list">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`assignment-item ${currentAssignmentId === assignment.id ? 'active' : ''
                  } ${completedAssignments[assignment.id] ? 'completed' : ''}`}
                onClick={() => handleSelectAssignment(assignment.id)}
              >
                <div className="assignment-number">
                  {completedAssignments[assignment.id] ? '✓' : assignment.number}
                </div>
                <div className="assignment-info">
                  <div className="assignment-title">{assignment.title}</div>
                  <div className="assignment-subtitle">დავალება {assignment.number}</div>
                </div>
                <div className={`assignment-status ${completedAssignments[assignment.id] ? 'completed' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {currentAssignment ? (
            <>
              {/* Assignment Header */}
              <header className="assignment-header">
                <h2>დავალება {currentAssignment.number}: {currentAssignment.title}</h2>
                <p className="assignment-description" style={{ whiteSpace: 'pre-line' }}>
                  {currentAssignment.description}
                </p>
              </header>

              {/* Assignment Grid */}
              <div className="assignment-grid">
                {/* Left Column - Code Editor */}
                <div>
                  <div className="section-title">
                    <span className="section-title-icon">📝</span>
                    კოდის რედაქტორი
                  </div>
                  <CodeEditor
                    code={userCodes[currentAssignmentId] || ''}
                    onChange={handleCodeChange}
                    onRun={handleRun}
                    isRunning={isRunning}
                    fileName={`${currentAssignment.id}.py`}
                  />
                </div>

                {/* Right Column - World + Status */}
                <div>
                  <div className="section-title">
                    <span className="section-title-icon">🗺️</span>
                    კარელის სამყარო
                  </div>
                  <KarelWorld
                    world={currentWorld}
                    title={currentAssignment.title}
                    onReset={handleReset}
                    speed={animationSpeed}
                    onSpeedChange={setAnimationSpeed}
                  />

                  <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <StatusPanel
                      status={status}
                      message={statusMessage}
                      details={statusDetails}
                    />
                  </div>
                </div>
              </div>

              {/* Hints Section */}
              {currentAssignment.hints && currentAssignment.hints.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-xl)' }}>
                  {!showHints ? (
                    <div
                      className="card"
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--color-bg-tertiary)',
                        border: '1px dashed var(--color-border)'
                      }}
                      onClick={() => setShowHints(true)}
                    >
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        💡 შეგიძლიათ ნახოთ მინიშნება... (დააჭირეთ)
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="section-title" style={{ cursor: 'pointer' }} onClick={() => setShowHints(false)}>
                        <span className="section-title-icon">💡</span>
                        მინიშნებები
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          (დააჭირეთ დასამალად)
                        </span>
                      </div>
                      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                        <ul style={{
                          margin: 0,
                          paddingLeft: 'var(--spacing-lg)',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.8
                        }}>
                          {currentAssignment.hints.map((hint, index) => (
                            <li key={index}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>
                აირჩიეთ დავალება მარცხენა პანელიდან
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
