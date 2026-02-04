import { useState, useEffect, useMemo } from 'react';

/**
 * Basic Python syntax validation for Karel code
 * Returns array of errors found
 */
export function validateKarelSyntax(code) {
    const errors = [];
    const lines = code.split('\n');

    // Check for main function
    const hasMain = /def\s+main\s*\(\s*\)\s*:/.test(code);
    if (!hasMain && code.trim().length > 0) {
        errors.push({
            line: 1,
            message: 'def main(): ფუნქცია არ არის განსაზღვრული',
            severity: 'error'
        });
    }

    // Check for matching parentheses
    let parenCount = 0;
    code.split('').forEach((char, i) => {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
    });
    if (parenCount !== 0) {
        errors.push({
            line: null,
            message: 'ფრჩხილები არ არის დახურული',
            severity: 'error'
        });
    }

    // Check for common Karel function calls without parentheses
    const karelFunctions = [
        'move', 'turn_left', 'pick_beeper', 'put_beeper',
        'front_is_clear', 'left_is_clear', 'right_is_clear',
        'beepers_present', 'beepers_in_bag'
    ];

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Check for functions without ()
        karelFunctions.forEach(func => {
            const regex = new RegExp(`\\b${func}\\b(?!\\s*\\()`);
            if (regex.test(trimmed) && !trimmed.startsWith('#')) {
                errors.push({
                    line: idx + 1,
                    message: `${func} უნდა გამოიძახოთ ფრჩხილებით: ${func}()`,
                    severity: 'warning'
                });
            }
        });

        // Check for indentation issues after def, if, while
        if (/^(def|if|while|else|elif)\s+.*:/.test(trimmed)) {
            const nextLine = lines[idx + 1];
            if (nextLine && nextLine.trim() !== '' && !nextLine.startsWith(' ') && !nextLine.startsWith('\t')) {
                errors.push({
                    line: idx + 2,
                    message: 'მოსალოდნელია შეწევა (indentation)',
                    severity: 'error'
                });
            }
        }
    });

    return errors;
}

/**
 * Hook for real-time syntax validation
 */
export function useKarelValidation(code) {
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        // Debounce validation
        const timer = setTimeout(() => {
            const validationErrors = validateKarelSyntax(code);
            setErrors(validationErrors);
        }, 500);

        return () => clearTimeout(timer);
    }, [code]);

    return errors;
}
