import { React } from 'react';
import { toast } from 'react-toastify';
import './Home.css'
export default {
  info(msg){
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
  },

  uploadTimeRemaining(msg, remainingTime){
    console.log("time remaining message : ", msg);
    return toast.info({
      render:()=>
        <div>
          남은 시간 : {remainingTime}
        </div>
      ,
      type: toast.TYPE.INFO,
      className: 'toast-style',
      position: "bottom-right",
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });
  }
}