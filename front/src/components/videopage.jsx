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
  const [views, setViews] = useState(0);

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
      console.log("GetVideoData", resp.data);
      setLikes(resp.data.likes_count);
      setViews(resp.data.views_count);
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
      const resp = await axiosInstance.post("video_like/", { id });
      console.log("ClickLike", resp);
      setLikes(resp.data.likes);
    } catch (error) {
      console.error("Error ClickLike:", error);
    }
  }

  async function IncreaseView() {
    try {
      const resp = await axiosInstance.post("video_view/", { id });
      console.log("IncreaseView", resp);
      setViews(resp.data.views);
    } catch (error) {
      console.error("Error IncreaseView:", error);
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
            <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Страница видео</h2>

          <div key={VideoData.videofile} className="mb-6">
            <video className="w-full rounded-md mb-2" controls onPlay={IncreaseView}>
              <source src={VideoData.videofile} type="video/mp4" />
            </video>
            <p className="text-sm text-gray-600 mb-1">Просмотры: {views}</p>
            <p className="text-sm text-gray-600 mb-3">Лайки: {likes}</p>
            <button
              type="button"
              onClick={ClickLike}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Лайк
            </button>
          </div>

          <h3 className="text-xl font-semibold mb-3 text-gray-800">Комментарии</h3>
          <div className="space-y-4 mb-6">
            {Comments.map((c, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded">
                <a href={c.user_url} className="text-blue-600 hover:underline font-medium">
                  <p>Автор: {c.username}</p>
                </a>
                <p className="text-gray-700">{c.text}</p>
              </div>
            ))}
          </div>

          <form id="comment_form" onSubmit={commentCreate} className="space-y-3">
            <label htmlFor="id_comment" className="block text-sm font-medium text-gray-700">
              Создать комментарий
            </label>
            <input
              type="text"
              value={Comment}
              onChange={(e) => setComment(e.target.value)}
              id="id_comment"
              placeholder="Ваш комментарий..."
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Отправить
            </button>
          </form>
        </div>
  );
}

export default VideoPage;