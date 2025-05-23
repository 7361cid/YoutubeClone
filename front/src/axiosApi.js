import axios from 'axios'

const axiosInstance = axios.create({
    baseURL : 'http://127.0.0.1:8000/api/' ,
    timeout : 5000 ,
    headers : {
        'Authorization' : "JWT " + localStorage.getItem( 'access_token' ),
        'Content-Type' : 'application/json' ,
        'accept' : 'application/json, text/plain, */*'
    }
});

export default axiosInstance;