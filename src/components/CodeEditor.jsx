import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useKarelValidation } from '../hooks/useKarelValidation';
import './CodeEditor.css';


/**
 * Syntax highlighting for Karel Python code
 */
function highlightCode(code) {
    if (!code) return '';

    // Escape HTML
    let highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Comments (must be first to avoid conflicts)
    highlighted = highlighted.replace(
        /(#.*$)/gm,
        '<span class="comment">$1</span>'
    );

    // Multi-line strings/docstrings
    highlighted = highlighted.replace(
        /("""[\s\S]*?"""|'''[\s\S]*?''')/g,
        '<span class="string">$1</span>'
    );

    // Strings
    highlighted = highlighted.replace(
        /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
        '<span class="string">$1</span>'
    );

    // Keywords
    const keywords = ['def', 'if', 'else', 'elif', 'while', 'for', 'in', 'return', 'pass', 'break', 'continue', 'and', 'or', 'not', 'True', 'False', 'None'];
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    highlighted = highlighted.replace(keywordRegex, '<span class="keyword">$1</span>');

    // Karel built-in functions
    const karelFunctions = [
        'move', 'turn_left', 'pick_beeper', 'put_beeper',
        'front_is_clear', 'front_is_blocked',
        'left_is_clear', 'left_is_blocked',
        'right_is_clear', 'right_is_blocked',
        'beepers_present', 'no_beepers_present',
        'beepers_in_bag', 'no_beepers_in_bag',
        'facing_north', 'facing_south', 'facing_east', 'facing_west',
        'not_facing_north', 'not_facing_south', 'not_facing_east', 'not_facing_west',
        'run_karel_program'
    ];
    const funcRegex = new RegExp(`\\b(${karelFunctions.join('|')})(?=\\s*\\()`, 'g');
    highlighted = highlighted.replace(funcRegex, '<span class="builtin">$1</span>');

    // User function definitions
    highlighted = highlighted.replace(
        /\b(def)\s+(\w+)/g,
        '<span class="keyword">$1</span> <span class="function">$2</span>'
    );

    // Numbers
    highlighted = highlighted.replace(
        /\b(\d+)\b/g,
        '<span class="number">$1</span>'
    );

    // Operators and punctuation
    highlighted = highlighted.replace(
        /([():,])/g,
        '<span class="punctuation">$1</span>'
    );

    return highlighted;
}

/**
 * CodeEditor Component
 * A reusable syntax-highlighted code editor for Karel programs
 */
export default function CodeEditor({
    code,
    onChange,
    onRun,
    isRunning = false,
    readOnly = false,
    fileName = 'main.py'
}) {
    const textareaRef = useRef(null);
    const highlightRef = useRef(null);
    const lineNumbersRef = useRef(null);
    const [lineCount, setLineCount] = useState(1);

    // Syntax validation
    const validationErrors = useKarelValidation(code);
    const hasErrors = validationErrors.length > 0;

    // Calculate line count
    useEffect(() => {
        const lines = (code || '').split('\n').length;
        setLineCount(Math.max(lines, 1));
    }, [code]);

    // Sync scroll between textarea and highlight
    const handleScroll = useCallback((e) => {
        if (highlightRef.current) {
            highlightRef.current.scrollTop = e.target.scrollTop;
            highlightRef.current.scrollLeft = e.target.scrollLeft;
        }
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.target.scrollTop;
        }
    }, []);

    // Handle tab key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            onChange(newCode);
            // Set cursor position after the tab
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    }, [code, onChange]);

    // Handle code change
    const handleChange = useCallback((e) => {
        onChange(e.target.value);
    }, [onChange]);

    // Generate highlighted HTML
    const highlightedCode = useMemo(() => highlightCode(code), [code]);

    // Generate line numbers as array
    const lineNumbersArray = useMemo(() => {
        return Array.from({ length: lineCount }, (_, i) => i + 1);
    }, [lineCount]);

    return (
        <div className="code-editor-container">
            {/* Header */}
            <div className="code-editor-header">
                <div className="code-editor-tabs">
                    <div className="code-editor-tab">
                        <span className="code-editor-tab-icon">📄</span>
                        <span>{fileName}</span>
                    </div>
                </div>
                <div className="code-editor-actions">
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Python
                    </span>
                </div>
            </div>

            {/* Editor Body */}
            <div className="code-editor-body">
                {/* Line Numbers */}
                <div
                    ref={lineNumbersRef}
                    className="code-editor-line-numbers"
                >
                    {lineNumbersArray.map((num) => (
                        <div key={num} className="line-number">{num}</div>
                    ))}
                </div>

                {/* Code Area */}
                <div className="code-editor-textarea-wrapper">
                    {/* Syntax Highlighted Background */}
                    <pre
                        ref={highlightRef}
                        className="code-editor-highlight"
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />

                    {/* Actual Textarea */}
                    <textarea
                        ref={textareaRef}
                        className="code-editor-textarea"
                        value={code}
                        onChange={handleChange}
                        onScroll={handleScroll}
                        onKeyDown={handleKeyDown}
                        readOnly={readOnly}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        autoComplete="off"
                        placeholder="# დაწერეთ თქვენი კოდი აქ..."
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="code-editor-footer">
                <div className="code-editor-info">
                    <span>სტრიქონი: {lineCount}</span>
                    <span>სიმბოლო: {code?.length || 0}</span>
                    {hasErrors && (
                        <span style={{ color: 'var(--color-error)' }}>
                            ⚠ {validationErrors.length} შეცდომა
                        </span>
                    )}
                </div>
                <button
                    className="code-editor-run-btn"
                    onClick={onRun}
                    disabled={isRunning}
                >
                    {isRunning ? (
                        <>
                            <span className="spinner" style={{ width: 16, height: 16 }}></span>
                            <span>მიმდინარეობს...</span>
                        </>
                    ) : (
                        <>
                            <span className="icon">▶</span>
                            <span>გაშვება</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
