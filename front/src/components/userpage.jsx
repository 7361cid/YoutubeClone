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
            resp.data.profile.avatar = 'http://127.0.0.1:8000' + resp.data.profile.avatar
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
                entry.url = 'http://127.0.0.1:3000/video/' + entry.id;
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
                     <div> Страница пользователя {user.email}
                        <img src={Profile.avatar} width='400' alt="альтернативный текст"/>
                        <div> Форма Смены аватара </div>
                        <form id="avatar_form" enctype="multipart/form-data">
                            <div class="form-group">
                                <label for="id_avatar">Choose img for avatar </label>
                                <input type="file" onChange={handleFileImgChange} class="form-control-file" id="id_avatar" />
                            </div>
                            <button type="submit" onClick={handleImgUpload} class="btn btn-primary">Upload</button>
                        </form>
                        <div> Форма загрузки видео </div>
                        <form id="video_form" enctype="multipart/form-data">
                            <div class="form-group">
                                <label for="id_video">Choose video </label>
                                <input type="file" onChange={handleFileChange} class="form-control-file" id="id_video" />
                                <input type="text" value={VideoTitle} onChange={(e) => setVideoTitle(e.target.value)} id="id_title" />
                            </div>
                            <button type="submit" onClick={handleUpload} class="btn btn-primary">Upload</button>
                        </form>
                        <div> Форма Показа видео VideoData.videofile {VideoData.videofile} </div>
                            < div >
                                {VideoData.map((Video, index) => {
                                        return (
                                          <div key={index}>
                                                <p> {Video.name} </p>
                                                <p> Просмотры: {Video.views_count} </p>
                                                <p> Лайки: {Video.likes_count}</p>
                                                <video width='400' controls>
                                                    <source src={Video.videofile}  type='video/mp4'/>
                                                </video>
                                                <a href={Video.url}>
                                                    <img src={Video.thumb} width='400' alt="альтернативный текст"/>
                                                </a>
                                          </div>
                                        );
                                      })}
                            </div>
                     </div>
        )
}
export default UserPage;