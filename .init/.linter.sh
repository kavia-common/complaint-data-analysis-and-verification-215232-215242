#!/bin/bash
cd /home/kavia/workspace/code-generation/complaint-data-analysis-and-verification-215232-215242/complaint_data_analysis_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

