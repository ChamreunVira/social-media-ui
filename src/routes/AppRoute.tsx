import { Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import Login from "../pages/auth/Login"
import { ToastContainer } from "react-toastify"
import Register from "../pages/auth/Register"
import ProfileDetail from "../pages/ProfileDetail"
import ProfileForm from "../pages/ProfileForm"

const AppRoute = () => {
  return (
    <div>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/:nickname" element={<ProfileDetail/>}/>
        <Route path="/profile/edit" element={<ProfileForm/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
      </Routes>
      <ToastContainer />
    </div>
  )
}

export default AppRoute
