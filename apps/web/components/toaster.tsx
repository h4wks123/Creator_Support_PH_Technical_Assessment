"use client";

import { toast } from "react-toastify";

const toaster = (status: number, message: string) => {
  const toasterOutput = () => {
    //http request succesful
    if (status >= 200 && status <= 299) {
      return "success";
    }
    //redirection
    if (status >= 300 && status <= 399) {
      return "info";
    }
    // client error
    if (status >= 400 && status <= 499) {
      return "error";
    }
    // server error
    if (status >= 500 && status <= 599) {
      return "warning";
    }
    return "info";
  };

  const toastType = toasterOutput();

  toast[toastType](message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};

export default toaster;
