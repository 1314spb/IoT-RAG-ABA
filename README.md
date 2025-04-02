# Transforming ABA Therapy: An IoT-Guided, Retrieval-Augmented LLM Framework

## Table of Contents

- [Introduction](#introduction)
- [Objective](#objective)
- [System Overview](#system-overview)
- [Deployment](#deployment)
- [User Interface](#user-interface)
- [Methodology](#methodology)
- [Evaluation](#evaluation)
- [References](#references)
- [Acknowledgement](#acknowledgement)
- [License](#license)

## Introduction

Applied Behavior Analysis (ABA) is an evidence-based therapeutic approach aimed at improving socially significant behaviors among children with Special Educational Needs (SEN), especially Autism Spectrum Disorder (ASD). Despite its effectiveness, traditional ABA intervention requires extensive manual planning and real-time adaptation, placing significant demands on practitioners. This project proposes a novel integration of IoT sensing technology and a Retrieval-Augmented Generation (RAG) Large Language Model (LLM) framework to generate personalized ABA tasks dynamically and efficiently.

## Objective

The project aims to develop an integrated system capable of:
- Collecting and analyzing real-time physiological and behavioral data through IoT devices.
- Utilizing a Retrieval-Augmented Large Language Model fine-tuned on ABA tasks to generate personalized intervention tasks.
- Dynamically adapting generated tasks based on real-time emotional and behavioral predictions.

## System Overview

The proposed system consists of three main components:

1. **IoT Data Collection and Analysis**: Collect real-time sensor data (e.g., Blood Volume Pulse (BVP), Galvanic Skin Response (GSR), temperature, acceleration) from wearable devices, processed through deep learning models to predict the emotional and behavioral states of children.

2. **Retrieval-Augmented Generation (RAG)**: Semantic retrieval is conducted on structured ABA task datasets to identify relevant intervention templates. These templates, combined with real-time IoT predictions, form comprehensive prompts for an LLM.

3. **LoRA-GA Enhanced Fine-tuning of LLM**: The LLaMA 3.1-70B language model is fine-tuned using a low-rank adaptation method with gradient alignment (LoRA-GA), enabling efficient domain adaptation specifically tailored for ABA task generation.

## Deployment

### Prerequisites

- Docker
- NVIDIA GPU with at least 24 GB memory (e.g., RTX 3090 or equivalent)

### Steps to Deploy

1. Clone the repository:

```bash
git clone https://github.com/1314spb/IoT-RAG-ABA.git
cd RAG-LLM4ABA
```

2. Use Docker Compose to build and run:

```bash
docker-compose up --build
```

3. Access the application via browser at:

```
http://localhost:80
```

## User Interface

The system provides a web-based interface with the following pages:

1. **Home**: Overview of the system and features.
2. **History**: Historical data of ABA interventions for each child.
3. **Generate**: Generate personalized ABA tasks using IoT and retrieval-augmented LLM.
4. **Therapy**: View previous ABA tasks and monitor progress.
5. **Add Task**: Manually add or adjust ABA tasks.
6. **Analysis**: Visual analytics of intervention outcomes and child's progress.

## Methodology

### IoT Data Processing

- **Data Collection**: Gather sensor data including BVP, GSR, wrist temperature, and acceleration.
- **Preprocessing**: Normalize and clean sensor data, removing outliers using a 3-sigma method.
- **Feature Engineering**: Compute statistical and frequency-domain features for emotion and behavior classification.
- **Classification**: Deep learning classifiers (e.g., transformer-based) predict emotional states from processed IoT data.

### Retrieval-Augmented Generation (RAG)

- **Semantic Retrieval**: Use SentenceTransformers (e.g., `all-MiniLM-L6-v2`) to semantically search structured ABA task databases, identifying tasks relevant to predicted emotional states.
- **Prompt Construction**: Combine retrieved tasks and IoT predictions to create enriched prompts for the LLM.
- **Task Generation**: Generate tailored ABA tasks dynamically via a fine-tuned LLaMA 3.1-70B model.

### Fine-Tuning with LoRA-GA

- **Model Selection**: Use LLaMA 3.1-70B with QLoRA (4-bit quantization) and FlashAttention-2 for efficient fine-tuning.
- **LoRA-GA Method**: Low-rank adaptation with gradient alignment to enhance convergence and adaptation effectiveness.
- **Training and Validation**: Fine-tune the model on structured JSON datasets containing ABA tasks (90% train, 10% validation).
- **Evaluation Metrics**: Post-training evaluation uses automatic metrics (ROUGE, BLEU) for assessing task generation quality.

## Evaluation

### Model and System Evaluation

- **Semantic Retrieval Accuracy**: Validate retrieval relevance through semantic similarity scoring.
- **Generated Task Quality**: Evaluate generated ABA tasks using automated metrics (BLEU, ROUGE) against human-written tasks.
- **IoT Prediction Accuracy**: Measure accuracy and recall for predicted emotional and behavioral states.

### Integration and Performance Testing

- **Integration Testing**: Confirm seamless interaction between IoT, retrieval modules, and the LLM.
- **Stress Testing**: Evaluate system performance under high data throughput and concurrent requests.

### User Acceptance Testing (UAT)

- **Field Trials**: Real-world deployment and data collection to ensure functionality meets practitioner needs.
- **Feedback Loop**: Continuous collection of user feedback for iterative improvement.

## Reference
[1]: J.O. Cooper, T. E. Heron, and W. L. Heward, Applied behavior analysis. Pearson UK, 2020. \
[2]: H. S. Roane, W. W. Fisher, and J. E. Carr, “Applied behavior analysis as treatment for autism spectrum disorder,” The Journal of pediatrics, vol. 175, pp. 27–32, 2016. \
[3]: T. Eckes, U. Buhlmann, H.-D. Holling, and A. Möllmann, “Comprehensive aba-based interventions in the treatment of children with autism spectrum disorder–a meta-analysis,” BMC psychiatry, vol. 23, no. 1, p. 133, 2023. \
[4]: R. M. Foxx, “Applied behavior analysis treatment of autism: The state of the art,” Child and adolescent psychiatric clinics of North America, vol. 17, no. 4, pp. 821–834, 2008. \
[5]: R. Y.-Y. Chan, C. M. V. Wong, and Y. N. Yum, “Predicting behavior change in students with special education needs using multimodal learning analytics,” IEEE Access, vol. 11, pp. 63 238–63 251, 2023.

## Acknowledgement

This project adheres to the academic integrity policies of The Chinese University of Hong Kong. All submitted materials are original, properly referenced, and have not been used elsewhere without declaration.

## License

This project is licensed under the [MIT license](LICENSE).

