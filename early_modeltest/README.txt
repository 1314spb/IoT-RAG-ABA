### README for generating task
#### LLM generate result under 3 different scenarios
1. No any information about ABA test
2. Worse RAG (Provide a roughly information about ABA task)
3. RAG which is designed for ABA task generation

#### 6 task domain
1. Academic and Learning
2. Social Emotion
3. Communication
4. Sensory Motor Skill
5. Independent and Self-help
6. Behavioural Development

#### Naming rule
We will generate the result from different LLM (Claude, GPT4, Llama-3.1-8B), the result will be saved in a seperate file, which is named according to their scenario, task domain  and times.\
For example, if the result task is generated at the third time under Worse RAG and Social Emotion domain, the name of the result file will be "V2-D2-3.txt".\