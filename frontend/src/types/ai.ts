// ----------TIPOS DO SMART ASSIST (IA)----------
export type SmartAssistRequest = {
  title: string;
  discipline: string;
  summary: string;
};

export type SmartAssistResponse = {
  contents: string[];
  extraTopics: string[];
  tags: string[];
};
