export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  tooltipTitle?: string;
  tooltipDescription?: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT';
  image?: string;
  quizId: string;
  answers: Answer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}
