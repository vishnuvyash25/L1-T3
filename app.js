class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    // Reset all calculator states
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }

    // Delete the last character entered
    delete() {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by 0') {
            this.clear();
            return;
        }
        if (this.shouldResetDisplay) {
            this.currentOperand = '0';
            this.shouldResetDisplay = false;
            this.updateDisplay();
            return;
        }
        if (this.currentOperand.length <= 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    // Append number or decimal to the current operand
    appendNumber(number) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by 0') {
            this.currentOperand = '';
        }
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }
        
        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Handle leading zeros
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    // Choose operation to perform
    chooseOperation(operation) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by 0') return;
        
        // Allow updating operator if clicked consecutively without typing next number
        if (this.currentOperand === '0' && this.previousOperand !== '' && this.operation) {
            this.operation = operation;
            this.updateDisplay();
            return;
        }
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }

    // Toggle the sign of the current operand (positive / negative)
    toggleSign() {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by 0' || this.currentOperand === '0') return;
        
        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
        this.updateDisplay();
    }

    // Compute the arithmetic operation
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        // Do not calculate if inputs are invalid or missing
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Cannot divide by 0';
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.shouldResetDisplay = true;
                    this.updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        this.currentOperand = this.formatNumber(computation);
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    // Format number output to handle floating-point precision anomalies
    formatNumber(num) {
        if (isNaN(num)) return 'Error';
        if (!isFinite(num)) return 'Cannot divide by 0';
        
        // Handle floating-point precision to max 10 decimal digits
        const rounded = parseFloat(num.toFixed(10));
        return rounded.toString();
    }

    // Format operators for previous expression view
    getDisplaySymbol(operator) {
        if (operator === '*') return '×';
        if (operator === '/') return '÷';
        if (operator === '-') return '−';
        return operator;
    }

    // Render variables to HTML Display elements
    updateDisplay() {
        this.currentOperandElement.innerText = this.currentOperand;
        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.previousOperand} ${this.getDisplaySymbol(this.operation)}`;
        } else {
            this.previousOperandElement.innerText = this.previousOperand;
        }
        
        // Responsive display scale down for large number widths
        const length = this.currentOperand.length;
        if (length > 15) {
            this.currentOperandElement.style.fontSize = '20px';
        } else if (length > 10) {
            this.currentOperandElement.style.fontSize = '26px';
        } else {
            this.currentOperandElement.style.fontSize = '36px';
        }
    }
}

// DOM Elements Initialization
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Event Delegation for Keypad click handlers
document.querySelector('.keypad').addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    if (target.dataset.number) {
        calculator.appendNumber(target.dataset.number);
    } else if (target.dataset.operator) {
        calculator.chooseOperation(target.dataset.operator);
    } else if (target.dataset.action) {
        const action = target.dataset.action;
        if (action === 'all-clear') {
            calculator.clear();
        } else if (action === 'delete') {
            calculator.delete();
        } else if (action === 'toggle-sign') {
            calculator.toggleSign();
        } else if (action === 'calculate') {
            calculator.compute();
        }
    }
});

// Keyboard Accessibility & Hotkey Integration
document.addEventListener('keydown', (event) => {
    // Check if key is a digit or decimal point
    if (/[0-9.]/.test(event.key)) {
        event.preventDefault();
        calculator.appendNumber(event.key);
    }
    // Check if key is an operator
    else if (['+', '-', '*', '/'].includes(event.key)) {
        event.preventDefault();
        calculator.chooseOperation(event.key);
    }
    // Check if key is Enter or Equals
    else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculator.compute();
    }
    // Check if key is Backspace
    else if (event.key === 'Backspace') {
        event.preventDefault();
        calculator.delete();
    }
    // Check if key is Escape
    else if (event.key === 'Escape') {
        event.preventDefault();
        calculator.clear();
    }
});
