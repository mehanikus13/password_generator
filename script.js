document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    const decrementLengthBtn = document.getElementById('decrement-length');
    const incrementLengthBtn = document.getElementById('increment-length');
    const passwordDisplay = document.getElementById('password-display');
    const copyBtn = document.getElementById('copy-btn');
    const generateBtn = document.getElementById('generate-btn');
    const generateMultipleBtn = document.getElementById('generate-multiple-btn');
    const multiPasswordDisplay = document.getElementById('multi-password-display');

    const lowercaseEl = document.getElementById('lowercase');
    const uppercaseEl = document.getElementById('uppercase');
    const numbersEl = document.getElementById('numbers');
    const symbolsEl = document.getElementById('symbols');
    const excludeRepetitionEl = document.getElementById('exclude-repetition');
    const excludeAmbiguousEl = document.getElementById('exclude-ambiguous');

    // Character sets
    const charSets = {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>/?'
    };

    const ambiguousChars = /[1lI0O]/g;

    // --- Event Listeners ---

    // Sync slider and length display
    lengthSlider.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
    });

    decrementLengthBtn.addEventListener('click', () => {
        lengthSlider.value = parseInt(lengthSlider.value) - 1;
        lengthValue.textContent = lengthSlider.value;
        // Manually trigger input event
        lengthSlider.dispatchEvent(new Event('input'));
    });

    incrementLengthBtn.addEventListener('click', () => {
        lengthSlider.value = parseInt(lengthSlider.value) + 1;
        lengthValue.textContent = lengthSlider.value;
        // Manually trigger input event
        lengthSlider.dispatchEvent(new Event('input'));
    });

    // Generate button
    generateBtn.addEventListener('click', () => {
        const password = generatePassword();
        passwordDisplay.value = password;
    });

    // Copy button
    copyBtn.addEventListener('click', () => {
        if (passwordDisplay.value) {
            navigator.clipboard.writeText(passwordDisplay.value);
            copyBtn.textContent = 'Скопировано!';
            setTimeout(() => {
                copyBtn.textContent = 'Копировать';
            }, 2000);
        }
    });

    // Generate multiple passwords
    generateMultipleBtn.addEventListener('click', () => {
        multiPasswordDisplay.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const password = generatePassword();
            const passwordEl = document.createElement('div');
            passwordEl.textContent = password;
            multiPasswordDisplay.appendChild(passwordEl);
        }
    });


    // --- Password Generation Logic ---
    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const includeLowercase = lowercaseEl.checked;
        const includeUppercase = uppercaseEl.checked;
        const includeNumbers = numbersEl.checked;
        const includeSymbols = symbolsEl.checked;
        const excludeRepetition = excludeRepetitionEl.checked;
        const excludeAmbiguous = excludeAmbiguousEl.checked;

        let charPool = '';
        let guaranteedChars = [];
        let password = '';

        if (includeLowercase) {
            let lowercase = charSets.lowercase;
            if (excludeAmbiguous) lowercase = lowercase.replace(ambiguousChars, '');
            charPool += lowercase;
            guaranteedChars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
        }
        if (includeUppercase) {
            let uppercase = charSets.uppercase;
            if (excludeAmbiguous) uppercase = uppercase.replace(ambiguousChars, '');
            charPool += uppercase;
            guaranteedChars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
        }
        if (includeNumbers) {
            let numbers = charSets.numbers;
            if (excludeAmbiguous) numbers = numbers.replace(ambiguousChars, '');
            charPool += numbers;
            guaranteedChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
        }
        if (includeSymbols) {
            charPool += charSets.symbols;
            guaranteedChars.push(charSets.symbols[Math.floor(Math.random() * charSets.symbols.length)]);
        }

        if (charPool === '') {
            return 'Выберите опции';
        }

        if (excludeRepetition && charPool.length < length) {
            return 'Мало символов';
        }

        for (let i = guaranteedChars.length; i < length; i++) {
            let randomChar;
            do {
                randomChar = charPool[Math.floor(Math.random() * charPool.length)];
            } while (excludeRepetition && password.includes(randomChar));
            password += randomChar;
        }

        // Add guaranteed characters and shuffle
        password += guaranteedChars.join('');
        password = password.split('').sort(() => 0.5 - Math.random()).join('');

        // Trim to desired length in case guaranteedChars made it longer than needed
        // This scenario is unlikely with the current logic but good for safety
        return password.slice(0, length);
    }
});
