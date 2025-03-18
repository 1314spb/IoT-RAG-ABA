# RAG-ABA: Fine-Tuned Retrieval-Augmented Generation for Personalized ABA Task Generation

## Table of Contents

- [Introduction](#Introduction)
- [Obejective](#Objective)
- [Deployment](#Deployment)
- [Instructions](#Instructions)
- [Methodology](#Methodology)
- [Evaluation](#Evaluation)
- [Reference](#Reference)
- [Acknowledgement](#Acknowledgement)
- [License](#License)

## Introduction

Applied Behavior Analysis (ABA) is a recognized, evidence-based framework for improving socially significant behaviors in children with Special Educational Needs (SEN), primarily by structuring interventions around reinforcement, prompting, and shaping principles [1], [2], [3]. These interventions, while effective, demand extensive planning, monitoring, and real-time adaptation, which can overwhelm practitioners and limit scalability. In conventional implementations, ABA specialists must manually adjust tasks to keep pace with each child’s quickly evolving emotional and behavioral states, diminishing the possibility of delivering timely and context-sensitive interventions [4], [5].


## Objective

This project aims to develop an integrated system that combines IoT technology with a Retrieval-Augmented Generation (RAG) Large Language Model (LLM) to generate personalized ABA tasks in real-time for children with Special Educational Needs. The system is designed to enhance the efficiency and accuracy of ABA task design and dynamically adjust task content based on the child's real-time emotional and behavioral responses.

## Deployment

### Prerequisites

- Docker
- High performance GPU (Recommend NVIDIA RTX 3090 or above)

### Deployment Step

1. Clone the repository from GitHub

   ```bash
   git clone https://github.com/1314spb/RAG-LLM4ABA.git
   cd RAG-LLM4ABA
   ```

2. Use docker-compose to build and run the application

   ```bash
   docker-compose up --build
   ```

3. Open a browser and visit `http://localhost:80` to view the application.

   ```bash
   http://localhost:80
   ```

## Instructions

### Page
1. **Home Page**

   The home page provides an overview of the system and its functionalities.

2. **History Page**

   The history page displays the history of data with the child, including the date, student, and domain.

3. **Generate Page**

   The generate page allows users to select a student, date, and domain to generate personalized ABA tasks.

4. **Therapy Page**

   The therapy page displays the all past ABA tasks for the selected student.

5. **Add Page**

   The add page allows users to add new task, including task, subtask, domain, status, description and date for the selected student.

6. **Analysis Page**

   The analysis page provides a detailed visual piechart of the child's performance based on the uploaded tasks' status.

## Methodology

### IoT Sensory Data Collection

1. **Data Collection**: Collect IoT data, including temperature, acceration, GSR and BVP from using sensors.
2. **Data Preprocessing**: Clean and preprocess the raw data, including normalization and feature extraction.
3. **Feature Engineering**: Extract features from the preprocessed data, such as mean, variance, and frequency domain features.

### RAG Model Training

1. **Data Preprocessing**: Clean and structure the ABA task dataset, ensuring consistency in target, behavior, intervention, and outcome.
2. **RAG Model Integration**: Fine-tune a pre-trained LLM (Llama3) on the ABA task dataset to understand task structure and content.
3. **Task Generation**: When specific emotion or behavior states are detected, the RAG system retrieves relevant tasks and generates new, customized ABA tasks to adapt to the child's current state.

### System Integration

1. **Front-end (React.js)**: Develop a user-friendly web interface for therapists, educators, and parents to interact with the system.
2. **Back-end (Express.js)**: Implement a back-end server to handle task and IoT input and task generation.
3. **Database (MariaDB)**: Store ABA task data and IoT sensory data for future analysis and reference.
4. **API Implement**: Implement API to facilitate communication between the IoT sensor module, the RAG system and AI server.
   1. `GET: /api/pass_gen_tasks`: Take all pass generated task data of selected student from the database.
   2. `GET: api/students/:student_id`: Take all the task data of selected student from the database.
   3. `GET: /api/task_sum`: Take the sum of all the tasks' status data from the database.
   4. `POST: /api/generate`: Generate a new task for the selected student and save it to the database.
   5. `PATCH: /api/taskOnSave/:id`: Update the task detail and status of the selected task in the database.
3. **Hardware and Deployment**: Use high-performance GPU (NVIDIA RTX 3090 or above) to support real-time image processing and LLM operations. Deploy the system on a cloud platform (AWS) to ensure scalability and accessibility.

## Evaluation

### Model Evaluation

- **檢索模組**：測試檢索的準確性和相關性。
- **生成模組**：評估生成輸出的質量和連貫性。

### 系統集成測試

- **集成測試**：確保所有組件無縫協作。
- **壓力測試**：評估系統在高負載條件下的性能。

### 用戶驗收測試

- **實地試驗**：在真實場景中部署系統，收集功能數據。
- **反饋迴路**：收集用戶反饋，識別改進區域。

### 性能指標

- **響應時間**：測量系統對輸入的反應速度。
- **情感和行為檢測準確性**：評估系統檢測情感和行為的準確性。
- **生成任務的有效性**：評估任務是否滿足用戶需求和目標。

### 測試過程

1. **與現有系統比較**：將性能指標與現有解決方案進行比較，以評估改進情況。
2. **文檔記錄**：記錄所有測試結果，包括成功和需要改進的地方，使用圖表和圖形以增加清晰度。
3. **迭代測試**：根據反饋和性能指標不斷測試和調整，以實現最佳結果。

## Reference
[1]: J.O. Cooper, T. E. Heron, and W. L. Heward, Applied behavior analysis. Pearson UK, 2020. \\
[2]: H. S. Roane, W. W. Fisher, and J. E. Carr, “Applied behavior analysis as treatment for autism spectrum disorder,” The Journal of pediatrics, vol. 175, pp. 27–32, 2016. \\
[3]: T. Eckes, U. Buhlmann, H.-D. Holling, and A. Möllmann, “Comprehensive aba-based interventions in the treatment of children with autism spectrum disorder–a meta-analysis,” BMC psychiatry, vol. 23, no. 1, p. 133, 2023. \\
[4]: R. M. Foxx, “Applied behavior analysis treatment of autism: The state of the art,” Child and adolescent psychiatric clinics of North America, vol. 17, no. 4, pp. 821–834, 2008. \\
[5]: R. Y.-Y. Chan, C. M. V. Wong, and Y. N. Yum, “Predicting behavior change in students with special education needs using multimodal learning analytics,” IEEE Access, vol. 11, pp. 63 238–63 251, 2023. \\


## Acknowledgement

This project adheres to the academic integrity policy of The Chinese University of Hong Kong. The submitted work is original and has not been submitted to multiple courses or purposes without declaration. All cited sources are correctly referenced. No teaching materials are distributed, shared, or copied to gain unfair academic advantage without the permission of the instructor.

## License

This project is licensed under the terms of the [MIT license](LICENSE).