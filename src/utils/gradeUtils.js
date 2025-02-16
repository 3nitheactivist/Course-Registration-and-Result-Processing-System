// src/utils/gradeUtils.js

export const GRADE_RANGES = {
  A: { min: 70, max: 100, gpa: 4.0, description: 'Excellent' },
  B: { min: 60, max: 69.99, gpa: 3.0, description: 'Very Good' },
  C: { min: 50, max: 59.99, gpa: 2.0, description: 'Good' },
  D: { min: 45, max: 49.99, gpa: 1.0, description: 'Pass' },
  F: { min: 0, max: 44.99, gpa: 0.0, description: 'Fail' }
};

/**
 * Calculates grade and GPA based on total score
 * @param {number} totalScore - The total score (0-100)
 * @returns {Object} Object containing grade, gpa, and description
 */
export const calculateGradeAndGPA = (totalScore) => {
  // Ensure score is within valid range
  const validScore = Math.max(0, Math.min(100, totalScore));
  
  // Find matching grade range
  const grade = Object.entries(GRADE_RANGES).find(([_, range]) => 
    validScore >= range.min && validScore <= range.max
  );

  // Return grade info or default to F
  if (grade) {
    const [letterGrade, details] = grade;
    return {
      grade: letterGrade,
      gpa: details.gpa,
      description: details.description
    };
  }

  return {
    grade: 'F',
    gpa: 0.0,
    description: 'Fail'
  };
};

/**
 * Validates if a score is within the maximum allowed value
 * @param {number} score - The score to validate
 * @param {number} maxAllowed - Maximum allowed score
 * @returns {boolean} Whether the score is valid
 */
export const isValidScore = (score, maxAllowed) => {
  return score >= 0 && score <= maxAllowed;
};

/**
 * Calculates CGPA from an array of course results
 * @param {Array} results - Array of course results with grades and credit hours
 * @returns {number} Calculated CGPA
 */
export const calculateCGPA = (results) => {
  if (!results?.length) return 0;

  const totalPoints = results.reduce((sum, result) => {
    const gradeInfo = GRADE_RANGES[result.grade];
    return sum + (gradeInfo?.gpa || 0) * (result.creditHours || 0);
  }, 0);

  const totalCreditHours = results.reduce((sum, result) => 
    sum + (result.creditHours || 0), 0);

  if (totalCreditHours === 0) return 0;
  
  return Number((totalPoints / totalCreditHours).toFixed(2));
};

/**
 * Returns a class of degree based on CGPA
 * @param {number} cgpa - The calculated CGPA
 * @returns {string} Class of degree
 */
export const getClassOfDegree = (cgpa) => {
  if (cgpa >= 3.5) return 'First Class';
  if (cgpa >= 3.0) return 'Second Class Upper';
  if (cgpa >= 2.0) return 'Second Class Lower';
  if (cgpa >= 1.0) return 'Third Class';
  return 'Fail';
};

/**
 * Formats a grade display with description
 * @param {string} grade - The letter grade
 * @returns {string} Formatted grade with description
 */
export const formatGrade = (grade) => {
  const gradeInfo = GRADE_RANGES[grade];
  if (!gradeInfo) return `${grade} (Invalid)`;
  return `${grade} (${gradeInfo.description})`;
};

/**
 * Checks if a student has passed a course
 * @param {string} grade - The letter grade
 * @returns {boolean} Whether the grade is a pass
 */
export const isPassing = (grade) => {
  return grade !== 'F';
};