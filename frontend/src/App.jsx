import { BrowserRouter, Routes, Route } from "react-router-dom";

// Masters
import AdminMaster from "./layouts/admin/AdminMaster";
import UserMaster from "./layouts/user/UserMaster";
import StudentMaster from "./layouts/student/StudentMaster";

// User Components
import UserHome from "./components/user/UserHome";
import UserAbout from "./components/user/UserAbout";
import UserContact from "./components/user/UserContact";
import UserRegister from "./components/user/UserRegister";
import UserShop from "./components/user/UserShop";
import UserLogin from "./components/user/UserLogin";

//Admin Components
import AdminDashBoard from "./components/admin/AdminDashBoard";
import AdminManageStudent from "./components/admin/AdminManageStudent";
import AdminCourse from "./components/admin/AdminCourse";
import AdminSubject from "./components/admin/AdminSubject";
import AdminCourseUpdate from "./components/admin/AdminCourseUpdate";
import AdminAddCourse from "./components/admin/AdminAddCourse";
import AdminAddSubject from "./components/admin/AdminAddSubject";
import AdminUpdateSubject from "./components/admin/AdminUpdateSubject";
import AdminMaterialType from "./components/admin/AdminMaterialType";

// Student Components
import StudentHome from "./components/student/StudentHome";
import StudentProfile from "./components/student/StudentProfile";
import StudentProfileUpdate from "./components/student/StudentProfileUpdate";
import StudentUpdatePassword from "./components/student/StudentUpdatePassword";
import StudentMaterial from "./components/student/StudentMaterial";
import StudentAddMaterial from "./components/student/StudentAddMaterial";
import StudentUpdateMaterial from "./components/student/StudentUpdateMaterial";
import StudentYourMaterial from "./components/student/StudentYourMaterial";
import StudentPlayList from "./components/student/StudentPlayList";
import StudentYourPlayList from "./components/student/StudentYourPlayList";
import StudentUpdatePlayList from "./components/student/StudentUpdatePlayList";
import StudentAddPlayList from "./components/student/StudentAddPlayList";
import StudentRequest from "./components/student/StudentRequest";
import StudentFlashCard from "./components/student/StudentFlashCard";
import StudentYourCard from "./components/student/StudentYourCard";
import StudentCardUpdate from "./components/student/StudentCardUpdate";
import StudentViewMaterialCard from "./components/student/StudentViewMaterialCard";
import StudentAddFlashCard from "./components/student/StudentAddFlashCard";

//payment
import PaymentInitialization from "./components/payment/PaymentInitialization";
export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* user routes */}
          <Route path="/" element={<UserMaster />}>
            <Route path="/" element={<UserHome />} />
            <Route path="/about" element={<UserAbout />} />
            <Route path="/contact" element={<UserContact />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/shop" element={<UserShop />} />
            <Route path="/login" element={<UserLogin />} />
          </Route>
          {/* admin routes */}
          <Route path="/admin" element={<AdminMaster />}>
            <Route path="/admin" element={<AdminDashBoard />} />
            <Route path="/admin/students" element={<AdminManageStudent />} />
            <Route path="/admin/course" element={<AdminCourse />} />
            <Route path="/admin/course/update/:id" element={<AdminCourseUpdate />} />
            <Route path="/admin/course/add" element={<AdminAddCourse />} />
            <Route path="/admin/subject" element={<AdminSubject />} />
            <Route path="/admin/subject/add" element={<AdminAddSubject />} />
            <Route path="/admin/subject/update/:id" element={<AdminUpdateSubject />} />
            <Route path="/admin/material-type" element={<AdminMaterialType />} />
          </Route>
          {/* student routes */}
          <Route path="/student" element={<StudentMaster />}>
            <Route path="/student" element={<StudentHome />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/profile/update/:id" element={<StudentProfileUpdate />} />
            <Route path="/student/profile/update/password" element={<StudentUpdatePassword />} />
            <Route path="/student/material" element={<StudentMaterial />} />
            <Route path="/student/material/add" element={<StudentAddMaterial />} />
            <Route path="/student/material/your/update/:id" element={<StudentUpdateMaterial />} />
            <Route path="/student/material/your" element={<StudentYourMaterial />} />
            <Route path="/student/playlist" element={<StudentPlayList />} />
            <Route path="/student/playlist/your" element={<StudentYourPlayList />} />
            <Route path="/student/playlist/your/update/:id" element={<StudentUpdatePlayList />} />
            <Route path="/student/playlist/add" element={<StudentAddPlayList />} />
            <Route path="/student/request" element={<StudentRequest />} />
            <Route path="/student/flashcard" element={<StudentFlashCard />} />
            <Route path="/student/flashcard/your" element={<StudentYourCard />} />
            <Route path="/student/flashcard/your/update/:id" element={<StudentCardUpdate />} />
            <Route path="/student/flashcard/view/:id" element={<StudentViewMaterialCard />} />
            <Route path="/student/flashcard/add" element={<StudentAddFlashCard />} />
          </Route>
          {/* Payment Initialization Route */}
          <Route path="/payment" element={<PaymentInitialization />}/>
        </Routes>
      </BrowserRouter>
    </>

  );
}
