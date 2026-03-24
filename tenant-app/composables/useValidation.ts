export const useValidation = () => {
  const isValidEmail = (email: string): boolean => {
    // Strict email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const sanitizeError = (error: any): string => {
    // If it's an object with a message, return that.
    // Check common error structures (e.g. Nuxt/Fetch errors often have data.message)
    if (error) {
       if (typeof error === 'string') return error;

       if (error.data?.error?.type === 'VALIDATION' && error.data?.error?.fields) {
         const fields = error.data.error.fields;
         for (const key in fields) {
           if (Array.isArray(fields[key]) && fields[key].length > 0 && fields[key][0].message) {
             return fields[key][0].message;
           }
         }
       }

       const message = error.data?.message || error.message;
       if (message && typeof message === 'string') {
         return message;
       }
    }
    return 'An unexpected error occurred';
  };

  return {
    isValidEmail,
    sanitizeError
  };
};
