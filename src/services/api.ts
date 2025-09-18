const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  // Auth methods
  async login(email: string, password: string, role: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(userData: any) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return this.request('/auth/logout', { method: 'POST' });
  }

  // User methods
  async getUsers(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/users${queryString}`);
  }

  async getStudents(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/users/students${queryString}`);
  }

  async getFaculty(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/users/faculty${queryString}`);
  }

  async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Course methods
  async getCourses(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/courses${queryString}`);
  }

  async getCourseById(id: string) {
    return this.request<any>(`/courses/${id}`);
  }

  async createCourse(courseData: any) {
    return this.request<any>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: any) {
    return this.request<any>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async enrollStudent(courseId: string, studentId: string) {
    return this.request<any>(`/courses/${courseId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  }

  async removeStudent(courseId: string, studentId: string) {
    return this.request<any>(`/courses/${courseId}/enroll/${studentId}`, {
      method: 'DELETE',
    });
  }

  // Grade methods
  async getGrades(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/grades${queryString}`);
  }

  async getStudentGrades(studentId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/grades/student/${studentId}${queryString}`);
  }

  async getCourseGrades(courseId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/grades/course/${courseId}${queryString}`);
  }

  async createGrade(gradeData: any) {
    return this.request<any>('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async updateGrade(id: string, gradeData: any) {
    return this.request<any>(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gradeData),
    });
  }

  async deleteGrade(id: string) {
    return this.request<any>(`/grades/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance methods
  async getAttendance(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/attendance${queryString}`);
  }

  async getStudentAttendance(studentId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/attendance/student/${studentId}${queryString}`);
  }

  async getCourseAttendance(courseId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/attendance/course/${courseId}${queryString}`);
  }

  async markAttendance(attendanceData: any) {
    return this.request<any>('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(id: string, attendanceData: any) {
    return this.request<any>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  }

  async deleteAttendance(id: string) {
    return this.request<any>(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  // Statistics methods
  async getUserStats() {
    return this.request<any>('/users/stats/overview');
  }

  async getCourseStats() {
    return this.request<any>('/courses/stats/overview');
  }

  async getAttendanceStats(studentId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/attendance/stats/student/${studentId}${queryString}`);
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
