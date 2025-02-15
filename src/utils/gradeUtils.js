// src/utils/gradeUtils.js

export const calculateGrade = (totalScore) => {
    if (totalScore >= 90) return "A";
    if (totalScore >= 80) return "B";
    if (totalScore >= 70) return "C";
    if (totalScore >= 60) return "D";
    return "F";
  };
  
  export const calculateGPA = (grade) => {
    switch (grade) {
      case "A":
        return 4.0;
      case "B":
        return 3.0;
      case "C":
        return 2.0;
      case "D":
        return 1.0;
      case "F":
        return 0.0;
      default:
        return 0.0;
    }
  };
  