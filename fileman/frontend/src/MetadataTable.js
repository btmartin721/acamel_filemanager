import React from 'react';
import PropTypes from 'prop-types';
import './MetadataTable.css';

function MetadataTable({ metadata, selectedFolder }) {

    console.log("Type of metadata:", typeof metadata); // Debugging line
    console.log("Value of metadata:", metadata); // Debugging line

    const filteredMetadata = metadata.filter(item => item.directory === selectedFolder);

    if (!filteredMetadata || filteredMetadata.length === 0) {
        return <div>No metadata available for the selected folder.</div>;
    }

    if (!Array.isArray(metadata)) {
        return <div>Metadata is not available or not in the expected format.</div>;
    }

    if (metadata.length === 0) {
        return <div>No metadata available.</div>;
    }
    // Check if metadata is available
    if (!metadata || metadata.length === 0) {
        return <div>No metadata available.</div>;
    }

    return (
        <div className="metadata-table-container">
            <h2>File Metadata</h2>
            <table className="metadata-table">
                <thead>
                    <tr>
                        <th className="metadata-header">Filename</th>
                        <th className="metadata-header">Version</th>
                        <th className="metadata-header">Type</th>
                        <th className="metadata-header">Date Created</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMetadata.map((record, index) => (
                        <tr key={index} className="metadata-row">
                            <td className="metadata-cell">{record.filename}</td>
                            <td className="metadata-cell">{record.version}</td>
                            <td className="metadata-cell">{record.type}</td>
                            <td className="metadata-cell">{record.date_created}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Add PropTypes
MetadataTable.propTypes = {
    metadata: PropTypes.arrayOf(PropTypes.shape({
        filename: PropTypes.string.isRequired,
        version: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        date_created: PropTypes.string.isRequired,
    })).isRequired,
};

export default MetadataTable;
