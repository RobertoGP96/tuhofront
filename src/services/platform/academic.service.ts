import { apiClient } from '../api';
import type {
  Course,
  Subject,
  Enrollment,
  Grade,
  Assignment,
  StudentSubmission,
  CreateEnrollmentData,
  UpdateGradeData,
  CreateAssignmentData,
  SubmitAssignmentData
} from '../../types/platform/academic';
import type { ApiResponse, PaginatedResponse } from '../api/client';

// Endpoints de cursos y materias
const ACADEMIC_ENDPOINTS = {
  COURSES: '/platform/courses/',
  SUBJECTS: '/platform/subjects/',
  ENROLLMENTS: '/platform/enrollments/',
  GRADES: '/platform/grades/',
  ASSIGNMENTS: '/platform/assignments/',
  SUBMISSIONS: '/platform/submissions/',
  MY_COURSES: '/platform/my-courses/',
  MY_SUBJECTS: '/platform/my-subjects/',
  MY_ENROLLMENTS: '/platform/my-enrollments/',
  MY_GRADES: '/platform/my-grades/',
} as const;

class AcademicService {
  // ============ CURSOS ============
  
  /**
   * Obtener lista de cursos
   */
  async getCourses(page = 1, pageSize = 10, search?: string): Promise<PaginatedResponse<Course>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Course>>>(
      `${ACADEMIC_ENDPOINTS.COURSES}?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener cursos');
  }

  /**
   * Obtener curso por ID
   */
  async getCourseById(id: number): Promise<Course> {
    const response = await apiClient.get<ApiResponse<Course>>(
      `${ACADEMIC_ENDPOINTS.COURSES}${id}/`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener curso');
  }

  // ============ MATERIAS ============

  /**
   * Obtener lista de materias
   */
  async getSubjects(page = 1, pageSize = 10, courseId?: number): Promise<PaginatedResponse<Subject>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (courseId) {
      params.append('course_id', courseId.toString());
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Subject>>>(
      `${ACADEMIC_ENDPOINTS.SUBJECTS}?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener materias');
  }

  /**
   * Obtener materia por ID
   */
  async getSubjectById(id: number): Promise<Subject> {
    const response = await apiClient.get<ApiResponse<Subject>>(
      `${ACADEMIC_ENDPOINTS.SUBJECTS}${id}/`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener materia');
  }

  /**
   * Obtener materias del usuario actual (profesor o estudiante)
   */
  async getMySubjects(): Promise<Subject[]> {
    const response = await apiClient.get<ApiResponse<Subject[]>>(
      ACADEMIC_ENDPOINTS.MY_SUBJECTS
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener mis materias');
  }

  // ============ MATRÍCULAS ============

  /**
   * Matricularse en una materia
   */
  async enrollInSubject(data: CreateEnrollmentData): Promise<Enrollment> {
    const response = await apiClient.post<ApiResponse<Enrollment>>(
      ACADEMIC_ENDPOINTS.ENROLLMENTS,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al matricularse');
  }

  /**
   * Obtener mis matrículas
   */
  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await apiClient.get<ApiResponse<Enrollment[]>>(
      ACADEMIC_ENDPOINTS.MY_ENROLLMENTS
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener matrículas');
  }

  /**
   * Cancelar matrícula
   */
  async cancelEnrollment(enrollmentId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${ACADEMIC_ENDPOINTS.ENROLLMENTS}${enrollmentId}/`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al cancelar matrícula');
    }
  }

  // ============ CALIFICACIONES ============

  /**
   * Obtener calificaciones de una materia
   */
  async getGradesBySubject(subjectId: number): Promise<Grade[]> {
    const response = await apiClient.get<ApiResponse<Grade[]>>(
      `${ACADEMIC_ENDPOINTS.GRADES}?subject_id=${subjectId}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener calificaciones');
  }

  /**
   * Obtener mis calificaciones
   */
  async getMyGrades(): Promise<Grade[]> {
    const response = await apiClient.get<ApiResponse<Grade[]>>(
      ACADEMIC_ENDPOINTS.MY_GRADES
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener mis calificaciones');
  }

  /**
   * Actualizar calificación (solo profesores)
   */
  async updateGrade(gradeId: number, data: UpdateGradeData): Promise<Grade> {
    const response = await apiClient.patch<ApiResponse<Grade>>(
      `${ACADEMIC_ENDPOINTS.GRADES}${gradeId}/`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al actualizar calificación');
  }

  // ============ TAREAS ============

  /**
   * Obtener tareas de una materia
   */
  async getAssignmentsBySubject(subjectId: number): Promise<Assignment[]> {
    const response = await apiClient.get<ApiResponse<Assignment[]>>(
      `${ACADEMIC_ENDPOINTS.ASSIGNMENTS}?subject_id=${subjectId}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener tareas');
  }

  /**
   * Crear tarea (solo profesores)
   */
  async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
    let response: ApiResponse<Assignment>;

    if (data.attachments && data.attachments.length > 0) {
      // Si hay archivos adjuntos, usar FormData
      const formData = new FormData();
      formData.append('subject_id', data.subject_id.toString());
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('assignment_type', data.assignment_type);
      formData.append('due_date', data.due_date);
      formData.append('max_score', data.max_score.toString());

      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      response = await apiClient.upload<ApiResponse<Assignment>>(
        ACADEMIC_ENDPOINTS.ASSIGNMENTS,
        formData
      );
    } else {
      // Sin archivos, usar JSON
      response = await apiClient.post<ApiResponse<Assignment>>(
        ACADEMIC_ENDPOINTS.ASSIGNMENTS,
        {
          subject_id: data.subject_id,
          title: data.title,
          description: data.description,
          assignment_type: data.assignment_type,
          due_date: data.due_date,
          max_score: data.max_score,
        }
      );
    }

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al crear tarea');
  }

  /**
   * Obtener tarea por ID
   */
  async getAssignmentById(id: number): Promise<Assignment> {
    const response = await apiClient.get<ApiResponse<Assignment>>(
      `${ACADEMIC_ENDPOINTS.ASSIGNMENTS}${id}/`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener tarea');
  }

  // ============ ENTREGAS ============

  /**
   * Enviar tarea
   */
  async submitAssignment(data: SubmitAssignmentData): Promise<StudentSubmission> {
    let response: ApiResponse<StudentSubmission>;

    if (data.attachments && data.attachments.length > 0) {
      // Si hay archivos adjuntos, usar FormData
      const formData = new FormData();
      formData.append('assignment_id', data.assignment_id.toString());
      if (data.content) {
        formData.append('content', data.content);
      }

      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      response = await apiClient.upload<ApiResponse<StudentSubmission>>(
        ACADEMIC_ENDPOINTS.SUBMISSIONS,
        formData
      );
    } else {
      // Sin archivos, usar JSON
      response = await apiClient.post<ApiResponse<StudentSubmission>>(
        ACADEMIC_ENDPOINTS.SUBMISSIONS,
        {
          assignment_id: data.assignment_id,
          content: data.content,
        }
      );
    }

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al enviar tarea');
  }

  /**
   * Obtener entregas de una tarea
   */
  async getSubmissionsByAssignment(assignmentId: number): Promise<StudentSubmission[]> {
    const response = await apiClient.get<ApiResponse<StudentSubmission[]>>(
      `${ACADEMIC_ENDPOINTS.SUBMISSIONS}?assignment_id=${assignmentId}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener entregas');
  }

  /**
   * Obtener mis entregas
   */
  async getMySubmissions(): Promise<StudentSubmission[]> {
    const response = await apiClient.get<ApiResponse<StudentSubmission[]>>(
      `${ACADEMIC_ENDPOINTS.SUBMISSIONS}?my_submissions=true`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener mis entregas');
  }

  /**
   * Calificar entrega (solo profesores)
   */
  async gradeSubmission(submissionId: number, grade: number, feedback?: string): Promise<StudentSubmission> {
    const response = await apiClient.patch<ApiResponse<StudentSubmission>>(
      `${ACADEMIC_ENDPOINTS.SUBMISSIONS}${submissionId}/`,
      { grade, feedback }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al calificar entrega');
  }
}

// Instancia singleton del servicio académico
export const academicService = new AcademicService();

// Export default para compatibilidad
export default academicService;