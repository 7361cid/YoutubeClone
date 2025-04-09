import './App.css';
import Login from "./components/login" ;
import UserPage from "./components/userpage" ;
import AnotherUserPage from "./components/AnotherUserPage" ;
import VideoPage from "./components/videopage" ;
import AppContext from './components/AppContext';
import { BrowserRouter, Switch, Route, Link } from "react-router-dom" ;
import {useContext, useState, createContext} from "react";

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sharedUser, setSharedUser] = useState('');
  const [sharedPassword, setSharedPassword] = useState('');
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  return (
    <AppContext.Provider value={{ searchTerm, setSearchTerm, sharedUser, setSharedUser, sharedPassword, setSharedPassword }}>
    < BrowserRouter >

                   <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-xl p-4 flex-shrink-0">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Меню</h2>
            <nav className="flex flex-col space-y-4">
              <a href="/userpage/" className="text-gray-700 hover:text-blue-600">Страница пользователя</a>
              <a href="/login/" className="text-gray-700 hover:text-blue-600">Вход</a>
              <a href="/logout/" className="text-gray-700 hover:text-blue-600">Выход</a>
              <a href="/signup/" className="text-gray-700 hover:text-blue-600">Регистрация</a>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8 overflow-auto">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Добро пожаловать</h1>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded w-full mb-4"
            />
            <Switch>
              <Route exact path="/login/" component={Login} />
              <Route exact path="/userpage/" component={UserPage} />
              <Route path="/video/:id" component={VideoPage} />
              <Route path="/user/:id" component={AnotherUserPage} />
            </Switch>
          </main>
        </div>

            </ BrowserRouter >
            </AppContext.Provider>
  );
}

export default App;
