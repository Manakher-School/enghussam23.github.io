import React, { createContext, useState, useContext, useEffect } from 'react';
import localforage from 'localforage';

const GradeContext = createContext();

const GRADES = [
  { id: 'KG', label: { ar: 'روضة', en: 'Kindergarten' } },
  { id: '1', label: { ar: 'الصف الأول', en: 'Grade 1' } },
  { id: '2', label: { ar: 'الصف الثاني', en: 'Grade 2' } },
  { id: '3', label: { ar: 'الصف الثالث', en: 'Grade 3' } },
  { id: '4', label: { ar: 'الصف الرابع', en: 'Grade 4' } },
  { id: '5', label: { ar: 'الصف الخامس', en: 'Grade 5' } },
  { id: '6', label: { ar: 'الصف السادس', en: 'Grade 6' } },
];

const SECTIONS = ['أ', 'ب', 'ج', 'د'];

export const GradeProvider = ({ children }) => {
  const [gradeSelection, setGradeSelection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGradeSelection();
  }, []);

  const loadGradeSelection = async () => {
    try {
      const saved = await localforage.getItem('gradeSelection');
      if (saved) {
        setGradeSelection(saved);
      }
    } catch (error) {
      console.error('Error loading grade selection:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGradeSelection = async (selection) => {
    try {
      await localforage.setItem('gradeSelection', selection);
      setGradeSelection(selection);
    } catch (error) {
      console.error('Error saving grade selection:', error);
    }
  };

  const clearGradeSelection = async () => {
    try {
      await localforage.removeItem('gradeSelection');
      setGradeSelection(null);
    } catch (error) {
      console.error('Error clearing grade selection:', error);
    }
  };

  return (
    <GradeContext.Provider
      value={{
        gradeSelection,
        saveGradeSelection,
        clearGradeSelection,
        loading,
        grades: GRADES,
        sections: SECTIONS,
      }}
    >
      {children}
    </GradeContext.Provider>
  );
};

export const useGrade = () => {
  const context = useContext(GradeContext);
  if (!context) {
    throw new Error('useGrade must be used within GradeProvider');
  }
  return context;
};
