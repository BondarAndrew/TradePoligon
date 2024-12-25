// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(26, 31, 61, 0.95)';
    } else {
        navbar.style.backgroundColor = 'rgba(26, 31, 61, 0.8)';
    }
});

// Feature cards animation on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    observer.observe(card);
});

// Button hover effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const cryptoSelector = document.getElementById('cryptoSelector');
    const cryptoDropdown = document.getElementById('cryptoDropdown');
    const cryptoOptions = document.querySelectorAll('.crypto-option');
    const selectedCryptoIcon = document.getElementById('selectedCryptoIcon');
    const selectedCryptoText = document.getElementById('selectedCryptoText');
    const fiatInput = document.getElementById('fiatAmount');
    const cryptoAmount = document.getElementById('cryptoAmount');
    const currentRate = document.getElementById('currentRate');

    let selectedCrypto = 'BTC';
    let isDropdownOpen = false;
    let previousPrices = {
        BTC: 0,
        ETH: 0,
        SOL: 0
    };

    // Cryptocurrency prices
    const cryptoPrices = {
        BTC: 0,
        ETH: 0,
        SOL: 0
    };

    // Format numbers with commas
    function formatNumber(number) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        }).format(number);
    }

    // Update rate display with animation
    function updateRateDisplay() {
        const price = cryptoPrices[selectedCrypto];
        const prevPrice = previousPrices[selectedCrypto];
        
        if (price !== prevPrice) {
            currentRate.classList.add('updating');
            setTimeout(() => {
                currentRate.classList.remove('updating');
            }, 600);
        }
        
        currentRate.textContent = `1 ${selectedCrypto} = ${formatNumber(price)} USD`;
        previousPrices[selectedCrypto] = price;
    }

    // Update crypto prices from Binance API
    async function updateCryptoPrices() {
        try {
            const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
            const responses = await Promise.all(
                symbols.map(symbol =>
                    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
                        .then(response => response.json())
                )
            );

            responses.forEach(response => {
                const symbol = response.symbol;
                const price = parseFloat(response.price);
                
                if (symbol === 'BTCUSDT') cryptoPrices.BTC = price;
                if (symbol === 'ETHUSDT') cryptoPrices.ETH = price;
                if (symbol === 'SOLUSDT') cryptoPrices.SOL = price;
            });

            updateRateDisplay();
            updateCalculator();
        } catch (error) {
            console.error('Error fetching prices:', error);
            currentRate.textContent = 'Ошибка загрузки';
        }
    }

    // Update calculator values
    function updateCalculator() {
        const fiatAmount = parseFloat(fiatInput.value) || 0;
        const cryptoValue = fiatAmount / cryptoPrices[selectedCrypto];
        cryptoAmount.value = formatNumber(cryptoValue);
    }

    // Toggle dropdown
    function toggleDropdown(event) {
        event.stopPropagation();
        
        if (!isDropdownOpen) {
            // Close any other open dropdowns first
            document.querySelectorAll('.crypto-dropdown.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
            
            cryptoDropdown.classList.add('show');
            cryptoSelector.classList.add('active');
            isDropdownOpen = true;
        } else {
            closeDropdown();
        }
    }

    // Close dropdown
    function closeDropdown() {
        cryptoDropdown.classList.remove('show');
        cryptoSelector.classList.remove('active');
        isDropdownOpen = false;
    }

    // Update selected crypto display
    function updateSelectedCrypto(crypto) {
        selectedCrypto = crypto;
        const logoUrls = {
            'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
            'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
            'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.svg'
        };
        selectedCryptoIcon.src = logoUrls[crypto];
        selectedCryptoIcon.alt = crypto;
        selectedCryptoText.textContent = crypto;
        updateRateDisplay();
        updateCalculator();
    }

    // Event Listeners
    cryptoSelector.addEventListener('click', toggleDropdown);

    document.addEventListener('click', (event) => {
        if (!cryptoDropdown.contains(event.target) && !cryptoSelector.contains(event.target)) {
            closeDropdown();
        }
    });

    cryptoOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            event.stopPropagation();
            updateSelectedCrypto(option.dataset.crypto);
            closeDropdown();
        });
    });

    fiatInput.addEventListener('input', updateCalculator);

    // Initial setup
    updateCryptoPrices();
    
    // Update prices every 8 seconds
    setInterval(updateCryptoPrices, 8000);
});

// Crypto exchange functionality
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fiatAmount = document.getElementById('fiatAmount');
    const cryptoAmount = document.getElementById('cryptoAmount');
    const currentRate = document.getElementById('currentRate');
    const cryptoSelector = document.getElementById('cryptoSelector');
    const cryptoDropdown = document.getElementById('cryptoDropdown');
    const selectedCryptoIcon = document.getElementById('selectedCryptoIcon');
    const selectedCryptoText = document.getElementById('selectedCryptoText');

    // Mock exchange rates
    const exchangeRates = {
        BTC: 103182.43,
        ETH: 3896.30,
        SOL: 717.20
    };

    // Update crypto amount based on fiat input
    function updateCryptoAmount() {
        const selectedCrypto = selectedCryptoText.textContent;
        const rate = exchangeRates[selectedCrypto];
        const fiatValue = parseFloat(fiatAmount.value);
        
        if (!isNaN(fiatValue) && rate) {
            cryptoAmount.value = (fiatValue / rate).toFixed(8);
            currentRate.textContent = `1 ${selectedCrypto} = $${rate.toLocaleString()}`;
        }
    }

    // Event listeners
    fiatAmount.addEventListener('input', updateCryptoAmount);

    // Crypto selector dropdown
    cryptoSelector.addEventListener('click', () => {
        cryptoDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!cryptoSelector.contains(e.target)) {
            cryptoDropdown.classList.remove('show');
        }
    });

    // Handle crypto selection
    document.querySelectorAll('.crypto-option').forEach(option => {
        option.addEventListener('click', () => {
            const crypto = option.dataset.crypto;
            const icon = option.querySelector('img').src;
            
            selectedCryptoIcon.src = icon;
            selectedCryptoText.textContent = crypto;
            cryptoDropdown.classList.remove('show');
            updateCryptoAmount();
        });
    });

    // Initialize
    updateCryptoAmount();
});

// Add animation classes on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.feature-card, .crypto-item, .exchange-container');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('animate-in');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);
