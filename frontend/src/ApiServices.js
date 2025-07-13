import axios from "axios";
import { data } from "react-router-dom";

const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

class ApiServices {

    //-----------------------------------get token-----------------------------------//

    getToken() {
        const token = sessionStorage.getItem('authToken');
        return token ? { Authorization: `${token}` } : {};
        // Always include "Bearer " prefix for JWT tokens
    }

    //-----------------------------------Admin Services-----------------------------------//

    Login(data) {
        return axios.post(`${baseURL}/admin/user/login`, data);
    }
    DashBoard() {
        return axios.get(`${baseURL}/admin/dashboard`, {
            headers: this.getToken()
        });
    }

    //student
    GetAllStudents(data) {
        return axios.post(`${baseURL}/admin/student/all`, data, {
            headers: this.getToken()
        });
    }
    ChangeStudentStatus(data) {
        return axios.put(`${baseURL}/admin/student/change-status/${data.id}`, data, {
            headers: this.getToken()
        });
    }
    GetStudentById(id) {
        return axios.get(`${baseURL}/admin/student/single/${id}`, {
            headers: this.getToken()
        });
    }
    //course
    GetAllCourses(data) {
        return axios.post(`${baseURL}/admin/course/all`, data, {
            headers: this.getToken()
        });
    }
    ChangeCourseStatus(data) {
        return axios.put(`${baseURL}/admin/course/change-status/${data.id}`, data, {
            headers: this.getToken()
        });
    }
    UpdateCourse(id, formData) {
        return axios.put(`${baseURL}/admin/course/update/${id}`, formData, {
            headers: this.getToken()
        });
    }
    GetCourseById(id) {
        return axios.get(`${baseURL}/admin/course/${id}`, {
            headers: this.getToken()
        });
    }
    AddCourse(formData) {
        return axios.post(`${baseURL}/admin/course/add`, formData, {
            headers: this.getToken()
        });
    }

    //subject
    GetAllSubject(data) {
        return axios.post(`${baseURL}/admin/subject/all`, data, {
            headers: this.getToken()
        });
    }
    ChangeSubjectStatus(data) {
        return axios.put(`${baseURL}/admin/subject/change-status/${data.id}`, data, {
            headers: this.getToken()
        });
    }
    UpdateSubject(id, formData) {
        return axios.put(`${baseURL}/admin/subject/update/${id}`, formData, {
            headers: this.getToken()
        });
    }
    GetSubjectById(id) {
        return axios.get(`${baseURL}/admin/subject/single/${id}`, {
            headers: this.getToken()
        });
    }
    AddSubject(formData) {
        return axios.post(`${baseURL}/admin/subject/add`, formData, {
            headers: this.getToken()
        });
    }

    // Material Type
    GetAllMaterialType(data) {
        return axios.post(`${baseURL}/admin/material-type/all`, data, {
            headers: this.getToken()
        });
    }
    ChangeMaterialTypeStatus(data) {
        return axios.put(`${baseURL}/admin/material-type/change-status/${data.id}`, data, {
            headers: this.getToken()
        });
    }
    UpdateMaterialType(id, data) {
        return axios.put(`${baseURL}/admin/material-type/update/${id}`, data, {
            headers: this.getToken()
        });
    }
    GetMaterialTypeById(id) {
        return axios.get(`${baseURL}/admin/material-type/single/${id}`, {
            headers: this.getToken()
        });
    }
    AddMaterialType(data) {
        return axios.post(`${baseURL}/admin/material-type/add`, data, {
            headers: this.getToken()
        });
    }

    //-----------------------------------Student Services-----------------------------------//

    AddStudent(formData) {
        return axios.post(`${baseURL}/student/student/register`, formData, {
            headers: this.getToken()
        });
    }
    GetStudentById(id) {
        return axios.get(`${baseURL}/admin/student/single/${id}`, {
            headers: this.getToken()
        });
    }
    UpdateStudent(id, formData) {
        return axios.put(`${baseURL}/student/student/update/${id}`, formData, {
            headers: this.getToken()
        });
    }
    UpdatePassword(body) {
        return axios.post(`${baseURL}/student/user/changepassword`, body, {
            headers: this.getToken()
        });
    }

    //material
    GetAllMaterial(data) {
        return axios.post(`${baseURL}/student/material/all`, data, {
            headers: this.getToken()
        });
    }
    AddMaterial(formData) {
        return axios.post(`${baseURL}/student/material/add`, formData, {
            headers: this.getToken()
        });
    }
    GetMaterialById(id) {
        return axios.get(`${baseURL}/student/material/single/${id}`, {
            headers: this.getToken()
        });
    }
    UpdateMaterial(id, formData) {
        return axios.put(`${baseURL}/student/material/update/${id}`, formData, {
            headers: this.getToken()
        });
    }
    DeleteMaterial(id) {
        return axios.delete(`${baseURL}/student/material/delete/${id}`, {
            headers: this.getToken()
        });
    }
    //playList
    GetAllPlayList(data) {
        return axios.post(`${baseURL}/student/playlist/all`, data, {
            headers: this.getToken()
        });
    }
    AddPlayList(data) {
        return axios.post(`${baseURL}/student/playlist/add`, data, {
            headers: this.getToken()
        });
    }
    GetPlayListById(id) {
        return axios.get(`${baseURL}/student/playlist/single/${id}`, {
            headers: this.getToken()
        });
    }
    UpdatePlayList(id, formData) {
        return axios.put(`${baseURL}/student/playlist/update/${id}`, formData, {
            headers: this.getToken()
        });
    }
    DeletePlayList(id) {
        return axios.delete(`${baseURL}/student/playlist/delete/${id}`, {
            headers: this.getToken()
        });
    }
    ChangePublicStatus(id, data) {
        return axios.put(`${baseURL}/student/playlist/change-public-status/${id}`, data, {
            headers: this.getToken()
        });
    }

    //request
    GetAllRequest(data) {
        return axios.post(`${baseURL}/student/request/all`, data, {
            headers: this.getToken()
        });
    }
    AddRequest(data) {
        return axios.post(`${baseURL}/student/request/add`, data, {
            headers: this.getToken()
        });
    }
    //flashcard
    GetAllFlashCards(data) {
        return axios.post(`${baseURL}/student/flashcard/all`, data, {
            headers: this.getToken()
        });
    }
    AddFlashCard(data) {
        return axios.post(`${baseURL}/student/flashcard/add`, data, {
            headers: this.getToken()
        });
    }
    GetFlashCardById(id) {
        return axios.get(`${baseURL}/student/flashcard/single/${id}`, {
            headers: this.getToken()
        });
    }
    UpdateFlashCard(id, formData) {
        return axios.put(`${baseURL}/student/flashcard/update/${id}`, formData, {
            headers: this.getToken()
        });
    }
    DeleteFlashCard(id) {
        return axios.delete(`${baseURL}/student/flashcard/delete/${id}`, {
            headers: this.getToken()
        });
    }
    AddFlashCard(data) {
        return axios.post(`${baseURL}/student/flashcard/add`, data, {
            headers: this.getToken()
        });
    }

    //flashcard material
    GetAllFlashCardsItems(data) {
        return axios.post(`${baseURL}/student/flashcarditem/all`, data, {
            headers: this.getToken()
        });
    }
    AddFlashCardItem(data) {
        return axios.post(`${baseURL}/student/flashcarditem/add`, data, {
            headers: this.getToken()
        });
    }

    //payment
    PaymentInitialization(data) {
        return axios.post(`${baseURL}/student/payment/create`, data,{
            headers: this.getToken()
        });
    }


}

export default new ApiServices();