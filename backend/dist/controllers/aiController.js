"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triageSymptoms = void 0;
const triageSymptoms = async (req, res) => {
    try {
        const { symptoms, age, duration } = req.body;
        // In a production environment, this would call an LLM (e.g., OpenAI, Claude) 
        // or a specialized medical NLP model to analyze the symptoms.
        // For now, we simulate an AI Smart Triage decision engine using keywords.
        const lowered = symptoms.toLowerCase();
        let condition = "General Malaise";
        let urgency = "LOW";
        let recommendations = ["Rest and stay hydrated.", "Monitor symptoms for 24-48 hours."];
        let department = "General Practice";
        if (lowered.includes('chest pain') || lowered.includes('shortness of breath')) {
            condition = "Possible Cardiac Event or Severe Respiratory Distress";
            urgency = "CRITICAL";
            recommendations = ["Seek immediate emergency medical attention (Call 911).", "Do not drive yourself to the hospital."];
            department = "Emergency Department";
        }
        else if (lowered.includes('fever') && lowered.includes('cough')) {
            condition = "Viral Lower Respiratory Infection (e.g., Flu, COVID-19)";
            urgency = "MEDIUM";
            recommendations = ["Isolate to prevent spread.", "Take fever-reducing medication.", "Schedule a telemedicine consultation."];
            department = "Pulmonology or General Practice";
        }
        else if (lowered.includes('headache') && lowered.includes('light')) {
            condition = "Migraine";
            urgency = "LOW";
            recommendations = ["Rest in a quiet, dark room.", "Take prescribed abortive medication if available."];
            department = "Neurology";
        }
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        res.json({
            condition,
            urgency,
            recommendations,
            department,
            disclaimer: "This is an AI generated triage report and does not constitute professional medical advice."
        });
    }
    catch (error) {
        res.status(500).json({ error: 'AI processing failed' });
    }
};
exports.triageSymptoms = triageSymptoms;
//# sourceMappingURL=aiController.js.map