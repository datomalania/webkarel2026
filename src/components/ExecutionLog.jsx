import './ExecutionLog.css';

/**
 * ExecutionLog Component
 * Shows history of Karel commands executed
 */
export default function ExecutionLog({ commands = [], onClear }) {
    return (
        <div className="execution-log">
            <div className="execution-log-header">
                <span>📜 შესრულების ისტორია</span>
                {commands.length > 0 && (
                    <button
                        className="execution-log-clear"
                        onClick={onClear}
                        title="გასუფთავება"
                    >
                        🗑️ გასუფთავება
                    </button>
                )}
            </div>
            <div className="execution-log-content">
                {commands.length === 0 ? (
                    <div className="execution-log-empty">
                        კოდის გაშვების შემდეგ აქ გამოჩნდება შესრულებული ბრძანებები
                    </div>
                ) : (
                    commands.map((cmd, index) => (
                        <div key={index} className="execution-log-entry">
                            <span className="execution-log-step">#{index + 1}</span>
                            <span className="execution-log-command">{cmd.command}()</span>
                            {cmd.position && (
                                <span className="execution-log-details">
                                    → ({cmd.position.x}, {cmd.position.y}) {cmd.position.direction}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
