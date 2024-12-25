document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация API
    const API = {
        COINGECKO: {
            BASE_URL: 'https://api.coingecko.com/api/v3',
            endpoints: {
                COIN: (id) => `/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,
                MARKET_CHART: (id, days) => `/coins/${id}/market_chart?vs_currency=usd&days=${days}`
            },
            // Маппинг ID монет
            COIN_MAP: {
                'btc': 'bitcoin',
                'eth': 'ethereum',
                'bnb': 'binancecoin'
            },
            // Информация о криптовалютах
            COIN_INFO: {
                'bitcoin': {
                    algorithm: 'SHA-256',
                    category: 'Криптовалюта',
                    launch: '2009',
                    description: 'Биткойн — это первая децентрализованная цифровая валюта, созданная в 2009 году. Она работает без банков и посредников, предлагая быстрые переводы с минимальными комиссиями. Максимум 21 миллион монет делает Биткойн дефляционной валютой. Безопасность и прозрачность обеспечиваются алгоритмом SHA-256, а сеть поддерживается майнерами по всему миру.'
                },
                'ethereum': {
                    algorithm: 'Ethash',
                    category: 'Смарт-контракты',
                    launch: '2015',
                    description: 'Ethereum — это децентрализованная платформа для создания приложений, работающих без посредников. Ее ключевая технология — смарт-контракты, которые автоматизируют управление цифровыми активами. Здесь создаются токены, NFT и DeFi-сервисы. Все операции оплачиваются в ETH через комиссию Gas, зависящую от сложности транзакций и нагрузки сети. Ethereum — это фундамент для финансовых инноваций будущего.'
                },
                'binancecoin': {
                    algorithm: 'BFT',
                    category: 'Exchange Token',
                    launch: '2017',
                    description: 'Binance Coin (BNB) — это криптовалюта, созданная крупнейшей криптобиржей Binance. BNB используется для оплаты комиссий на бирже со скидкой и является основной валютой экосистемы Binance Smart Chain. Это платформа для создания децентрализованных приложений с низкими комиссиями и высокой скоростью транзакций.'
                }
            }
        },
        BINANCE: {
            BASE_URL: 'https://api.binance.com/api/v3',
            endpoints: {
                TICKER: (symbol) => `/ticker/24hr?symbol=${symbol}USDT`
            },
            // Маппинг символов
            SYMBOL_MAP: {
                'btc': 'BTC',
                'eth': 'ETH',
                'bnb': 'BNB'
            }
        }
    };

    // Состояние приложения
    const state = {
        coinId: new URLSearchParams(window.location.search).get('coin'),
        currentPeriod: '24h',
        chart: null,
        loading: false,
        error: null,
        data: {
            coin: null,
            price: null,
            chart: {}
        }
    };

    // Утилиты для форматирования
    const formatter = {
        currency: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }),
        number: new Intl.NumberFormat('en-US'),
        percent: new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            signDisplay: 'exceptZero'
        }),
        date: {
            '24h': (date) => date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            '7d': (date) => date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
            '30d': (date) => date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
            '1y': (date) => date.toLocaleDateString('ru-RU', { month: 'short' })
        }
    };

    // API клиент
    const api = {
        async fetch(baseUrl, endpoint, options = {}) {
            try {
                const response = await fetch(baseUrl + endpoint, {
                    ...options,
                    headers: {
                        'Accept': 'application/json',
                        ...options.headers
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        async getCoinData(coinId) {
            const mappedId = API.COINGECKO.COIN_MAP[coinId.toLowerCase()] || coinId;
            return await this.fetch(
                API.COINGECKO.BASE_URL,
                API.COINGECKO.endpoints.COIN(mappedId)
            );
        },

        async getChartData(coinId, period) {
            const mappedId = API.COINGECKO.COIN_MAP[coinId.toLowerCase()] || coinId;
            const days = {
                '24h': '1',
                '7d': '7',
                '30d': '30',
                '1y': '365'
            }[period] || '1';

            return await this.fetch(
                API.COINGECKO.BASE_URL,
                API.COINGECKO.endpoints.MARKET_CHART(mappedId, days)
            );
        },

        async getBinancePrice(symbol) {
            const mappedSymbol = API.BINANCE.SYMBOL_MAP[symbol.toLowerCase()] || symbol.toUpperCase();
            return await this.fetch(
                API.BINANCE.BASE_URL,
                API.BINANCE.endpoints.TICKER(mappedSymbol)
            );
        }
    };

    // UI компоненты
    const ui = {
        elements: {
            coinName: document.getElementById('coinName'),
            coinPrice: document.getElementById('coinPrice'),
            priceChange: document.getElementById('priceChange'),
            marketCap: document.getElementById('marketCap'),
            volume24h: document.getElementById('volume24h'),
            circulatingSupply: document.getElementById('circulatingSupply'),
            chartContainer: document.querySelector('.chart-container'),
            priceChart: document.getElementById('priceChart'),
            coinDescription: document.getElementById('coinDescription'),
            coinAlgorithm: document.getElementById('coinAlgorithm'),
            coinCategory: document.getElementById('coinCategory'),
            coinLaunch: document.getElementById('coinLaunch')
        },

        toggleLoading(loading) {
            state.loading = loading;
            this.elements.chartContainer.classList.toggle('loading', loading);
        },

        showError(message) {
            state.error = message;
            this.elements.coinName.textContent = 'Error';
            this.elements.coinPrice.textContent = '-';
            this.elements.priceChange.textContent = '-';
            // Показываем сообщение об ошибке
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            this.elements.chartContainer.appendChild(errorDiv);
        },

        updateCoinInfo(data) {
            if (!data) return;

            const coinInfo = API.COINGECKO.COIN_INFO[data.id] || {};
            
            this.elements.coinName.textContent = data.name;
            this.elements.coinPrice.textContent = formatter.currency.format(
                data.market_data?.current_price?.usd || 0
            );
            this.elements.priceChange.textContent = 
                formatter.percent.format(data.market_data?.price_change_percentage_24h || 0) + '%';
            this.elements.marketCap.textContent = 
                formatter.currency.format(data.market_data?.market_cap?.usd || 0);
            this.elements.volume24h.textContent = 
                formatter.currency.format(data.market_data?.total_volume?.usd || 0);
            this.elements.circulatingSupply.textContent = 
                formatter.number.format(data.market_data?.circulating_supply || 0);

            // Обновляем информацию о криптовалюте
            this.elements.coinDescription.textContent = coinInfo.description || 'Loading description...';
            this.elements.coinAlgorithm.textContent = coinInfo.algorithm || '-';
            this.elements.coinCategory.textContent = coinInfo.category || '-';
            this.elements.coinLaunch.textContent = coinInfo.launch || '-';
        },

        updateChart(chartData, period) {
            if (state.chart) {
                state.chart.destroy();
            }

            const ctx = this.elements.priceChart.getContext('2d');
            const timestamps = chartData.map(point => new Date(point[0]));
            const prices = chartData.map(point => point[1]);

            state.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timestamps.map(date => formatter.date[period](date)),
                    datasets: [{
                        label: 'Price',
                        data: prices,
                        borderColor: '#6c5dd3',
                        backgroundColor: 'rgba(108, 93, 211, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(26, 29, 41, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            callbacks: {
                                label: (context) => `Price: ${formatter.currency.format(context.raw)}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: '#848e9c',
                                maxRotation: 0,
                                autoSkip: true,
                                maxTicksLimit: 8
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: '#848e9c',
                                callback: (value) => formatter.currency.format(value)
                            }
                        }
                    }
                }
            });
        }
    };

    // Контроллер приложения
    const app = {
        async init() {
            this.setupEventListeners();
            await this.loadInitialData();
            this.startAutoUpdate();
        },

        setupEventListeners() {
            // Настройка кнопок периода
            document.querySelectorAll('[data-period]').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const period = e.target.dataset.period;
                    await this.updateChartPeriod(period);
                });
            });
        },

        async loadInitialData() {
            ui.toggleLoading(true);
            try {
                // Загружаем данные монеты и график параллельно
                const [coinData, chartData] = await Promise.all([
                    api.getCoinData(state.coinId),
                    api.getChartData(state.coinId, state.currentPeriod)
                ]);

                state.data.coin = coinData;
                state.data.chart[state.currentPeriod] = chartData.prices;

                ui.updateCoinInfo(coinData);
                ui.updateChart(chartData.prices, state.currentPeriod);
            } catch (error) {
                ui.showError(error.message);
            } finally {
                ui.toggleLoading(false);
            }
        },

        async updateChartPeriod(period) {
            if (period === state.currentPeriod) return;

            ui.toggleLoading(true);
            try {
                // Проверяем кэш
                if (!state.data.chart[period]) {
                    const chartData = await api.getChartData(state.coinId, period);
                    state.data.chart[period] = chartData.prices;
                }

                state.currentPeriod = period;
                ui.updateChart(state.data.chart[period], period);

                // Обновляем активную кнопку
                document.querySelectorAll('[data-period]').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.period === period);
                });
            } catch (error) {
                ui.showError(error.message);
            } finally {
                ui.toggleLoading(false);
            }
        },

        startAutoUpdate() {
            // Обновляем цену каждые 10 секунд
            setInterval(async () => {
                if (document.visibilityState === 'visible') {
                    try {
                        const priceData = await api.getBinancePrice(state.coinId.toUpperCase());
                        if (priceData.lastPrice) {
                            ui.elements.coinPrice.textContent = 
                                formatter.currency.format(parseFloat(priceData.lastPrice));
                        }
                    } catch (error) {
                        console.warn('Failed to update price:', error);
                    }
                }
            }, 10000);

            // Полное обновление данных каждые 5 минут
            setInterval(() => {
                if (document.visibilityState === 'visible') {
                    this.loadInitialData();
                }
            }, 300000);
        }
    };

    // Запускаем приложение
    app.init();
});
