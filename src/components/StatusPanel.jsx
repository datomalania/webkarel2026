import './StatusPanel.css';

/**
 * Status types
 */
export const StatusType = {
    IDLE: 'idle',
    RUNNING: 'running',
    SUCCESS: 'success',
    ERROR: 'error',
};

/**
 * StatusPanel Component
 * Shows the current status of code execution
 */
export default function StatusPanel({
    status = StatusType.IDLE,
    message = '',
    details = ''
}) {
    const renderContent = () => {
        switch (status) {
            case StatusType.SUCCESS:
                return (
                    <div className="status-success-message">
                        <div className="status-success-icon">🎉</div>
                        <div className="status-success-title">გილოცავთ!</div>
                        <div className="status-success-subtitle">
                            {message || 'დავალება წარმატებით შესრულდა!'}
                        </div>
                    </div>
                );

            case StatusType.ERROR:
                return (
                    <div className="status-error-message">
                        <div className="status-error-header">
                            <div className="status-error-icon">⚠️</div>
                            <div>
                                <div className="status-error-title">დაფიქსირდა პრობლემა</div>
                                <div className="status-error-subtitle">
                                    კოდში რაღაც არ მუშაობს
                                </div>
                            </div>
                        </div>
                        {(message || details) && (
                            <div className="status-error-details">
                                {message}
                                {details && `\n\n${details}`}
                            </div>
                        )}
                    </div>
                );

            case StatusType.RUNNING:
                return (
                    <div className="status-running-message">
                        <div className="status-running-spinner"></div>
                        <div className="status-running-text">
                            {message || 'კოდი მუშავდება...'}
                        </div>
                    </div>
                );

            case StatusType.IDLE:
            default:
                return (
                    <div className="status-idle-message">
                        <div className="status-idle-icon">💡</div>
                        <div className="status-idle-text">
                            დაწერეთ კოდი და დააჭირეთ "გაშვება" ღილაკს
                        </div>
                    </div>
                );
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case StatusType.SUCCESS: return '✅';
            case StatusType.ERROR: return '❌';
            case StatusType.RUNNING: return '⏳';
            default: return '📊';
        }
    };

    const getStatusTitle = () => {
        switch (status) {
            case StatusType.SUCCESS: return 'წარმატება';
            case StatusType.ERROR: return 'შეცდომა';
            case StatusType.RUNNING: return 'მიმდინარეობს';
            default: return 'სტატუსი';
        }
    };

    return (
        <div className={`status-panel status-${status}`}>
            <div className="status-panel-header">
                <span className="status-panel-icon">{getStatusIcon()}</span>
                {getStatusTitle()}
            </div>
            <div className="status-panel-content">
                {renderContent()}
            </div>
        </div>
    );
}
