import { useEffect, useState, useRef, useContext } from "react";
import axiosInstance from "../axiosApi";
import AppContext from "./AppContext";
import { useHistory, useParams } from "react-router-dom";

function VideoPage() {
  const [user, setUser] = useState([]);
  const isCalledRef = useRef(false);
  const history = useHistory();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [VideoData, setVideoData] = useState([]);
  const [Comments, setComments] = useState([]);
  const [Comment, setComment] = useState("");
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    if (!isCalledRef.current) {
      isCalledRef.current = true;
      GetUserData();
      GetVideoData();
    }
  }, []);

  async function GetUserData() {
    try {
      if (!axiosInstance.defaults.headers["AUTHORIZATION"]) {
        axiosInstance.defaults.headers["AUTHORIZATION"] =
          "JWT " + localStorage.getItem("access_token");
      }
      const resp = await axiosInstance.get(
        "http://127.0.0.1:8000/api/user/"
      );
      setUser(resp.data);
    } catch (error) {
      console.log("GetUserDataError", error);
      history.replace("/login");
    }
  }

  async function GetVideoData() {
    try {
      if (!axiosInstance.defaults.headers["AUTHORIZATION"]) {
        axiosInstance.defaults.headers["AUTHORIZATION"] =
          "JWT " + localStorage.getItem("access_token");
      }
      const resp = await axiosInstance.get(
        `http://127.0.0.1:8000/api/get_video/${id}/`
      );
      resp.data.videofile = "http://127.0.0.1:8000" + resp.data.videofile;
      setVideoData(resp.data);
      setLikes(resp.data.likes_count || 0);
      setComments(
        resp.data.comments.map((entry) => ({
          ...entry,
          user_url: `http://localhost:4173/user/${entry.owner}`,
        }))
      );
    } catch (error) {
      console.log("GetVideosData", error);
      history.replace("/login");
    }
  }

  async function ClickLike() {
    try {
      await axiosInstance.post("video_like/", { id });
      setLikes(likes + 1);
    } catch (error) {
      console.error("Error ViewCount:", error);
    }
  }

  const commentCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("comments/create/", { id, text: Comment });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div>
      <h2>Страница видео</h2>
      <div key={VideoData.videofile}>
        <video width="400" controls autoPlay>
          <source src={VideoData.videofile} type="video/mp4" />
        </video>
        <p>Просмотры: {VideoData.views_count}</p>
        <p>Лайки: {likes}</p>
        <button
          type="button"
          onClick={ClickLike}
          className="btn btn-primary"
        >
          Лайк
        </button>
      </div>

      <h3>Комментарии</h3>
      {Comments.map((c, index) => (
        <div key={index} className="comment">
          <a href={c.user_url}>
            <p>Автор: {c.username}</p>
          </a>
          <p>{c.text}</p>
        </div>
      ))}

      <form id="comment_form" onSubmit={commentCreate}>
        <label htmlFor="id_comment">Создать комментарий</label>
        <input
          type="text"
          value={Comment}
          onChange={(e) => setComment(e.target.value)}
          id="id_comment"
        />
        <button type="submit" className="btn btn-primary">
          Отправить
        </button>
      </form>
    </div>
  );
}

export default VideoPage;