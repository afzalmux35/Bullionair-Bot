declare global {
    namespace NodeJS {
      interface ProcessEnv {
        GEMINI_API_KEY: string;
        FXAPI_KEY: string;
      }
    }
  }
  
  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
  export {}
  