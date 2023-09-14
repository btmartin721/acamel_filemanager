import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectFolderDropdown from './ProjectFolderDropdown';
import MetadataTable from './MetadataTable';
import YAMLConfig from './YAMLConfig';

function MyApp() {
    const [metadata, setMetadata] = useState([]);
    const [yamlConfig, setYamlConfig] = useState({});
    const [folders, setFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState('');

    useEffect(() => {
        setIsLoading(true);
        console.log("YAMLConfig component re-rendered.");


        // Use Promise.all to wait for all API calls to complete
        Promise.all([
            axios.get('http://localhost:5000/get_metadata'),
            axios.get('http://localhost:5000/get_yaml_config'),
            axios.get('http://localhost:5000/get_folders')
        ]).then(([metadataRes, yamlConfigRes, foldersRes]) => {
            setMetadata(metadataRes.data.files);
            setYamlConfig(yamlConfigRes.data);
            if (foldersRes.data.folders) {
                setFolders(foldersRes.data.folders);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error('Error fetching data:', err);
            setError(err);
            setIsLoading(false);
        });
    }, []);
    console.log("Folders in MyApp:", folders);

    function updateYAMLConfig(newConfig) {
        setYamlConfig(newConfig);
    }
    console.log("Component re-rendered.");

    // Function to update the selected folder
    function handleFolderChange(newSelectedFolder) {
        setSelectedFolder(newSelectedFolder);
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    console.log("Folders in MyApp:", folders);


    return (
        <div className="MyApp">
            <h1>Research Project Manager</h1>
            <ProjectFolderDropdown folders={folders} onFolderChange={handleFolderChange} />
            <MetadataTable metadata={metadata} selectedFolder={selectedFolder} />
            <YAMLConfig
                yamlConfig={yamlConfig}
                updateYAMLConfig={updateYAMLConfig}
                metadata={metadata}
                selectedFolder={selectedFolder}
            />
        </div>
    );
}

export default MyApp;
