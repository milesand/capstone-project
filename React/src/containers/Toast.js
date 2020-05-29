import { toast } from 'react-toastify';
import './Home.css'
export default {
  info(msg){
    console.log("here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!, message : ", msg);
    return toast.info(msg, {
      className: 'toast-style',
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
}