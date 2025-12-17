// Placeholder for GenKit - prevents import errors
export const ai = {
  definePrompt: () => ({
    then: (callback: any) => callback({ 
      output: { 
        confirmationMessage: 'AI Prompt executed' 
      } 
    })
  }),
  defineFlow: () => async (input: any) => ({ 
    confirmationMessage: 'AI Flow executed' 
  })
};
