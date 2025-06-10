import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import ToDo from "./Tasks";
import ToDoForm from "./AddTask";

const TASKS_STORAGE_KEY = "tasks-list-project-web";
const WEATHER_API_KEY = "e7bc7a3b-708f-42f6-814f-98be2c495763";

function App() {
  const [rates, setRates] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Восстановление задач из LocalStorage
  const [todos, setTodos] = useState(() => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY); // Читает задачи из хранилища по ключу
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks); // Парсит JSON с задачами
        if (Array.isArray(parsedTasks)) {
          return parsedTasks; // Возвращает задачи
        } else {
          console.warn(
            "Задача была найдена, но имеет неправильное содержимое:",
            parsedTasks
          );
        }
      } catch (error) {
        console.error(
          "Ошибка при чтении задач из localStorage:",
          error.message
        );
      }
    }
    return []; // Возвращает пустой массив, если нет задач
  });

  useEffect(() => {
    async function fetchAllData() {
      try {
        const currencyResponse = await axios.get(
          "https://www.cbr-xml-daily.ru/daily_json.js"
        );

        if (!currencyResponse.data || !currencyResponse.data.Valute) {
          throw new Error("Нет данных о валюте.");
        }
        const USDrate = currencyResponse.data.Valute.USD.Value.toFixed(
          4
        ).replace(".", ",");
        const EURrate = currencyResponse.data.Valute.EUR.Value.toFixed(
          4
        ).replace(".", ",");
        setRates({
          USDrate,
          EURrate,
        });
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const weatherResponse = await axios.get(
              `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}`,
              {
                headers: {
                  "X-Yandex-Weather-Key": WEATHER_API_KEY,
                },
              }
            );

            if (!weatherResponse.data.fact) {
              throw new Error("Нет данных о погоде.");
            }

            setWeatherData(weatherResponse.data);
          },
          (error) => {
            console.error(error);
          }
        );
      } catch (err) {
        console.error(err);
        setError("Ошибка загрузки данных.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // Автосохранение задач в LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos)); // Сохранение задач в формате JSON
    } catch (error) {
      console.error(
        "Ошибка при сохранении задач в localStorage:",
        error.message
      );
    }
  }, [todos]); // срабатывает при изменениях в tasks

  const addTask = (userInput) => {
    if (userInput) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        task: userInput,
        complete: false,
      };
      setTodos([...todos, newItem]);
    }
  };

  const removeTask = (id) => {
    setTodos([...todos.filter((todo) => todo.id !== id)]);
  };

  const handleToggle = (id) => {
    setTodos([
      ...todos.map((task) =>
        task.id === id ? { ...task, complete: !task.complete } : { ...task }
      ),
    ]);
  };

  return (
    <>
      <div className="App">
        {/* // Проверяем состояние загрузки (loading): при loading === true,
        отображается сообщение "Загрузка..." */}
        {loading && <p>Загрузка...</p>}
        {/* // Если загрузка завершилась (!loading), проверяем наличие ошибки
        (error), в случае, если ошибка присутствует, выводим её красным цветом. */}
        {!loading && error && <p style={{ color: "red" }}>{error}</p>}
        {/* // Если ошибки нет, выводится информация, полученная из api */}
        {!loading && !error && (
          <>
            <div className="info">
              {/* // Блок money с текущими курсами USD и EUR */}
              <div className="money">
                <div id="USD">Доллар США $ — {rates.USDrate} руб.</div>
                <div id="EUR">Евро € — {rates.EURrate} руб.</div>
              </div>
              {/* // Если есть данные о погоде (weatherData), показываем блок с
              погодой: данные о температуре воздуха в переводе на градусы по
              Цельсию, скорость ветра, процент облачности и иконку погоды с
              изображением */}
              {weatherData && (
                <div className="weather-info">
                  <div>
                    Погода сегодня: <br></br> 🌡️{" "}
                    {weatherData.fact.temp.toFixed(1)}°C ༄.°{" "}
                    {weatherData.fact.wind_speed} м/с ☁️{" "}
                    {Math.round(weatherData.fact.cloudness * 100)}%
                  </div>
                  <img
                    className="weather-icon"
                    src={`https://yastatic.net/weather/i/icons/funky/dark/${weatherData.fact.icon}.svg`}
                    alt="Иконка погоды"
                  />
                </div>
              )}
            </div>
          </>
        )}
        {/* // Заголовочная секция header с заголовком списка задач и количеством 
        активных дел*/}
        <header>
          <h1 className="list-header">Список задач: {todos.length}</h1>
        </header>
        {/* // Форма добавления задач ToDoForm, передающая метод addTask в качестве
        пропса */}
        <ToDoForm addTask={addTask} />
        {/* // Компоненты задач Todo, создаваемые циклом map для каждого элемента
        массива todos */}
        {todos.map((todo) => {
          return (
            <ToDo
              todo={todo}
              key={todo.id}
              toggleTask={handleToggle}
              removeTask={removeTask}
            />
          );
        })}
      </div>
    </>
  );
}

export default App;
