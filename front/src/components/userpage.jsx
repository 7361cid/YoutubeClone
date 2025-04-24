import {useEffect, useState, useRef, useContext} from "react";
import axiosInstance from "../axiosApi" ;
import AppContext from './AppContext';
import { useHistory, useLocation } from 'react-router-dom';

function UserPage() {

    const [user, setUser] = useState([]);
    const [Profile, setProfile] = useState([]);
    const isCalledRef =  useRef(false);
    const history = useHistory();
    const { searchTerm, setSearchTerm, sharedUser, setSharedUser, sharedPassword, setSharedPassword } = useContext(AppContext);
    const [selectedFile, setSelectedFile] = useState(null);
    const [ImgFile, setImgFile] = useState(null);
    const [VideoTitle, setVideoTitle] = useState([]);
    const [VideoData, setVideoData] = useState([]);


    const handleFileChange = (e) => {
      setSelectedFile(e.target.files[0]);
    };

    const handleFileImgChange  = (e) => {
      setImgFile(e.target.files[0]);
    };

    useEffect(()=>{
        if (!isCalledRef.current) {  // чтобы постоянно не запрашивать данные пользователя
          isCalledRef.current = true;
          GetUserData();
          GetVideosData();
        }
    },[GetUserData]);

    useEffect(()=>{
          GetVideosData();
    },[searchTerm]);



async function GetUserData() {

       try {
            console.log("GetUserDataCall axiosInstance", axiosInstance.defaults.headers['AUTHORIZATION']);
            console.log("GetUserDataCall Context", sharedUser, sharedPassword);
            console.log(` sharedData ${sharedUser} ${sharedPassword} `);
            const resp = await axiosInstance.get('http://127.0.0.1:8000/api/user/');
            setUser(resp.data);
            console.log("GetUserDataCall2", resp.data);
            console.log("GetUserDataCall Profile", resp.data.profile);
            resp.data.profile.avatar = 'http://127.0.0.1:8000/media/' + resp.data.profile.avatar
            setProfile(resp.data.profile);
        } catch (error) {
            console.log("GetUserDataError", error);
            history.replace('/login')
        }
   }

async function GetVideosData() {

    try {
             console.log("GetVideosData");
             setVideoData([]);
             const resp = await axiosInstance.get(`http://127.0.0.1:8000/api/user_videos/?search=${searchTerm}`);
             resp.data.forEach(function(entry) {
                entry.videofile = 'http://127.0.0.1:8000' + entry.videofile;
                entry.thumb = 'http://127.0.0.1:8000' + entry.thumb;
                entry.url = ' http://localhost:4173/video/' + entry.id;
             });
             setVideoData(resp.data);

             console.log("GetVideosData3", resp.data);

        } catch (error) {
            console.log("GetVideosData", error);
            history.replace('/login')
        }

}
// 30min 2h practica все на неделю две , Пт 12ч
const handleImgUpload = async () => {

      const formData = new FormData();
      formData.append("file", ImgFile);

      try {
         console.log("formData", formData);
        const response = await axiosInstance.post('avatar_upload/', formData, {
            headers: {
            "Content-type": "multipart/form-date",
        }})
        console.log("handleUpload response", response);
      } catch (error) {
         console.error("Error while uploading the file avatar", error);
      }
   };

const handleUpload = async () => {

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", VideoTitle);

      try {
         console.log("formData", formData);
        const response = await axiosInstance.post('video_upload/', formData, {
            headers: {
            "Content-type": "multipart/form-date",
        }})
        console.log("handleUpload response", response);
         if (response.ok) {
            alert("File upload is  successfully");
         } else {
            alert("Failed to upload the file due to errors");
         }
      } catch (error) {
         console.error("Error while uploading the file:", error);
         alert("Error occurred while uploading the file");
      }
   };
        return (

                    <div className="max-w-2xl mx-auto mt-10 space-y-8">
                      {/* Блок профиля */}
                      <div className="bg-white p-6 rounded-xl shadow-md text-center">
                        <img
                          src={Profile.avatar}
                          alt="Аватар"
                          className="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
                        />
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                          {user.email}
                        </h2>
                        <label className="block mb-2 text-sm text-gray-600">
                          Сменить аватар:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileImgChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0 file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button type="submit" onClick={handleImgUpload} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Смена</button>
                      </div>

                      {/* Форма загрузки видео */}
                      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                        <div>
                          <label className="block mb-1 text-sm text-gray-600">
                            Название видео:
                          </label>
                          <input
                            type="text"
                            placeholder="Введите название"
                            value={VideoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm text-gray-600">
                            Загрузить видео:
                          </label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="text-sm"
                          />
                        </div>

                        <button
                          onClick={handleUpload}
                          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Сохранить
                        </button>
                      </div>

                      {/* Просмотр загруженных видео */}
                      <div className="space-y-6">
                        {VideoData.map((Video, index) => (
                          <div key={index} className="bg-white p-4 rounded shadow">
                            <p className="font-semibold">{Video.name}</p>
                            <p>Просмотры: {Video.views_count}</p>
                            <p>Лайки: {Video.likes_count}</p>
                            <video width="100%" controls className="my-2">
                              <source src={Video.videofile} type="video/mp4" />
                            </video>
                            <a href={Video.url}>
                              <img src={Video.thumb} width="100%" alt="Превью видео" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
        )
}
export default UserPage;