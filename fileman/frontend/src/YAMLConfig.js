import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './YAMLConfig.css';  // Importing styles

function YAMLConfig({ yamlConfig, updateYAMLConfig, metadata, selectedFolder }) {
    // Debug statements
    console.log("Metadata:", metadata);
    console.log("Selected Folder:", selectedFolder);
    // Function to handle changes in dropdown menus
    const handleDropdownChange = (stepIndex, key, newValue) => {
        const newYAMLConfig = JSON.parse(JSON.stringify(yamlConfig));
        newYAMLConfig.steps[stepIndex][key] = newValue;
        updateYAMLConfig(newYAMLConfig);
    };

    // Function to send the updated YAML config back to the Flask API
    const updateYAML = () => {
        axios.post('http://localhost:5000/update_yaml_config', yamlConfig)
            .then(response => {
                console.log('Successfully updated YAML config');
            })
            .catch(error => {
                console.error('Error updating YAML config:', error);
            });
    };

    // Inside your YAMLConfig function component
    console.log("Metadata:", JSON.stringify(metadata, null, 2));
    console.log("Selected Folder:", selectedFolder);

    // Filter metadata based on the selected folder
    const filteredMetadata = metadata.filter(item => item.directory === selectedFolder);


    console.log("Filtered Metadata:", filteredMetadata);

    // Function to handle adding a new step
    const addStep = () => {
        const newStep = {
            name: `Step ${yamlConfig.steps.length + 1}`,
            final_input: '',
            final_output: ''
        };
        const updatedSteps = [...yamlConfig.steps, newStep];
        const newYAMLConfig = { ...yamlConfig, steps: updatedSteps };
        updateYAMLConfig(newYAMLConfig);
    };

    // Function to handle removing the last step
    const removeStep = () => {
        const updatedSteps = [...yamlConfig.steps];
        updatedSteps.pop();
        const newYAMLConfig = { ...yamlConfig, steps: updatedSteps };
        updateYAMLConfig(newYAMLConfig);
    };

    return (
        <div>
            <h2>YAML Configuration</h2>
            {yamlConfig.steps && yamlConfig.steps.map((step, index) => (
                <div key={index} className="step-container">  {/* Add your styling class here */}
                    <h3>{step.name}</h3>
                    {/* Add your styling class here */}
                    <label className="label-dropdown">
                        Final Input:
                        {/* Add your styling class here */}
                        <select
                            className="dropdown-select"
                            value={step.final_input}
                            onChange={(e) => handleDropdownChange(index, 'final_input', e.target.value)}
                        >
                            {filteredMetadata.map((record, idx) => (
                                <option key={idx} value={record.filename}>
                                    {record.filename}
                                </option>
                            ))}
                        </select>
                    </label>
                    {/* Add your styling class here */}
                    <label className="label-dropdown">
                        Final Output:
                        {/* Add your styling class here */}
                        <select
                            className="dropdown-select"
                            value={step.final_output}
                            onChange={(e) => handleDropdownChange(index, 'final_output', e.target.value)}
                        >
                            {filteredMetadata.map((record, idx) => (
                                <option key={idx} value={record.filename}>
                                    {record.filename}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            ))}
            <button className="yaml-button" onClick={updateYAML}>Update YAML</button>
            <button className="add-step-button" onClick={addStep}>Add Step</button>
            <button className="remove-step-button" onClick={removeStep}>Remove Last Step</button>
        </div>
    );
}

export default YAMLConfig;
