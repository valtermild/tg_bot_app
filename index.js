const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const schedule = require('node-schedule');

// Telegram's token
const token = '988637218:AAFiIeoWfL7Mzf1lZu2DGJSrP77PcyV9b_E';

//OpenWeatherMap API key
const appID = '4bc46fdef1c9788a73524b5656a166ff';

// OpenWeatherMap endpoint for getting weather by city name
const weatherEndpoint = (city) => (
    `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${appID}&lang=ru`
);

// URL that provides icon according to the weather
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

// Template for weather response
const weatherHtmlTemplate = (name, main, weather, wind, clouds) => (

    `Погода в <b>${name}</b>:
На небе: <b>${weather.description}</b>
Температура: <b>${main.temp} °C</b>
Давление: <b>${main.pressure} hPa</b>
Влажность: <b>${main.humidity} %</b>
Ветер: <b>${wind.speed} м/с</b>
Облачность: <b>${clouds.all} %</b>
`
);

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
    polling: true
});

// Function that gets the weather by the city name
const getWeather = (chatId, city) => {
    const endpoint = weatherEndpoint(city);


    axios.get(endpoint).then((resp) => {
        const {
            name,
            main,
            weather,
            wind,
            clouds
        } = resp.data;

        bot.sendPhoto(chatId, weatherIcon(weather[0].icon))
        bot.sendMessage(
            chatId,
            weatherHtmlTemplate(name, main, weather[0], wind, clouds), {
            parse_mode: "HTML"
        }
        );
    }, error => {
        console.log("error", error);
        bot.sendMessage(
            chatId,
            `Возникла ошибка при запросе погоды в городе <b>${city}</b>`, {
            parse_mode: "HTML"
        }
        );
    });
}

// Listener (handler) for telegram's /weather event
bot.onText(/\/weather/, (msg, match) => {
    const chatId = msg.chat.id;
    console.log(chatId)
    const city = match.input.split(' ')[1];

    if (city === undefined) {
        bot.sendMessage(
            chatId,
            `Укажите город`
        );
        return;
    }
    getWeather(chatId, city);
    //console.log(msg.chat.id)
});

bot.onText(/\/rates/, (msg, match) => {
    const chatId = msg.chat.id;
    const currency = match.input.split(' ')[1];
    const currencyUpperCase = currency.toUpperCase()

    if (currency === undefined) {
        bot.sendMessage(
            chatId,
            `Укажите валюту: USD, EUR или любую другую`
        );
        return;
    }
    getCurrency(chatId, currencyUpperCase);
});

// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `Вечер в будку уважаемые!
    
Работают две команды:

/weather <b>город</b> на англицком сука - покажет погоду для указанного <b>города</b>

/rates <b>символ валюты</b> - покажет сколько деревянных нужно, чтобы получить иностранные денежные знаки
  `, {
        parse_mode: "HTML"
    }
    );
});


const getCurrency = (chatId, currency) => {
    const currencyURL = `https://api.ratesapi.io/api/latest?base=${currency}&symbols=RUB`


    axios.get(currencyURL).then((resp) => {
        const {
            rates
        } = resp.data;

        bot.sendMessage(
            chatId,
            `Курс обмена: ${rates.RUB.toFixed(2)} руб. за 1 ${currency}`, {
            parse_mode: "HTML"
        }
        );
    }, error => {
        console.log("error", error);
        bot.sendMessage(
            chatId,
            `Возникла ошибка при запросе курса валюты <b>${currency}</b>`, {
            parse_mode: "HTML"
        }
        );
    });
}

function sendWeather(time, city) {
    new schedule.scheduleJob({ hour: 4, minute: time }, function () {
        getWeather(-300783609, city);

    });
}

function sendRates(time, currency) {
    new schedule.scheduleJob({ hour: 4, minute: time }, function () {
        getCurrency(-300783609, currency);

    });
}
sendWeather(1, 'barnaul')
sendWeather(2, 'yalta')
sendRates(3, 'USD');
sendRates(4, 'EUR');


