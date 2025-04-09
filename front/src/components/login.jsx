import axios from "axios";
import {useEffect, useState, useContext} from "react";
import axiosInstance from "../axiosApi" ;
import { UserContext } from "../App";
import { useHistory } from "react-router";
import AppContext from './AppContext';

function Login() {

    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [LoginStatus, setLoginStatus] = useState('');
    const { searchTerm, setSearchTerm, sharedUser, setSharedUser, sharedPassword, setSharedPassword } = useContext(AppContext);
    let history = useHistory();

async function LoginSubmit(event) {
       event.preventDefault();
       try {
            const response = await axiosInstance.post('login/',
            { email, password });
            setSharedUser(email);
            setSharedPassword(password)
            console.log("RESp", response);
            setToken(response);
            axiosInstance.defaults.headers['AUTHORIZATION'] = "JWT " + response.data.tokens.access;
            localStorage.setItem( 'access_token' , response.data.tokens.access);
            localStorage.setItem( 'refresh_token' , response.data.tokens.refresh)
            history.push('/userpage/');
        } catch (error) {
            setLoginStatus(`Ошибка ${error.response}`);
        }
    };

        return (

             <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Вход в аккаунт</h2>
                {LoginStatus && <div className="text-red-500 text-center mb-4">{LoginStatus}</div>}
                <form onSubmit={LoginSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите email"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-600">Пароль</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите пароль"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Войти
                  </button>
                </form>
              </div>
            </div>

        )
}
export default Login;