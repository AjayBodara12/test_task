import axios from "axios";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@material-ui/core";
import Modal from '@material-ui/core/Modal';
const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newContent, setNewContent] = useState("");

  //fetchData from github API.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/AjayBodara12/testRepo/contents/`,
          {
            headers: {
              Authorization: `token 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`,
            },
          }
        );


        // Map over each file in the response and fetch its content
        const fileRequests = response.data.map((file) =>
          axios.get(file.url, {
            headers: {
              Authorization: `token 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`,
            },
          })
        );


        // Wait for all file content requests to complete
        const fileResponses = await Promise.all(fileRequests);

        // Map over each file response and add the content to its metadata
        const filesWithContent = fileResponses.filter(fileResponse => fileResponse && fileResponse.data && fileResponse.data.content).map((fileResponse) => ({
          ...fileResponse.data,
          content: atob(fileResponse.data.content),
        }));
        setFiles(filesWithContent);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData()
  }, []);

  //delete file from github API.
  const handleDelete = async (fileName, sha) => {
    try {
      const response = await axios.delete(
        `https://api.github.com/repos/AjayBodara12/testRepo/contents/${fileName}`,
        {
          headers: {
            Authorization: `token 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`,
          },
          data: {
            message: "Deleted file",
            sha: sha
          },
        }
      );
      setFiles(files.filter((file) => file.name !== fileName));
    } catch (error) {
      console.error(error.response.data);
    }
  }

  const handleCloseModal = async () => {
    setIsEditModalOpen(false)
  }

  const handleSave = async () => {
    try {
      // Retrieve latest SHA value of selected file
      const response = await axios.get(
        `https://api.github.com/repos/AjayBodara12/testRepo/contents/${selectedFile.name}`,
        {
          headers: {
            Authorization: `token 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`,
          },
        }
        );
      const latestSha = response.data.sha;

      // Update file with latest SHA value
      const updateResponse = await axios.put(
        `https://api.github.com/repos/AjayBodara12/testRepo/contents/${selectedFile.name}`,
        {
          message: "Update file",
          content: btoa(newContent),
          sha: latestSha,
        },
        {
          headers: {
            Authorization: `token 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`,
          },
        }
      );

      // Update state with updated file content
      const updatedFile = {
        name: selectedFile.name,
        content: newContent,
        sha: updateResponse.data.content.sha,
      };
      setFiles(
        files.map((file) =>
          file.name === selectedFile.name ? updatedFile : file
        )
      );
      setSelectedFile(updatedFile);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
    }

  };

  //Opening modal in the edit function
  const handleOpenModal = (file) => {
    setSelectedFile(file);
    setNewContent(file.content)
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.name}>
                <TableCell component="th" scope="row">
                  {file.name}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleDelete(file.name, file.sha)}>Delete</Button>
                  <Button onClick={() => handleOpenModal(file)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={isEditModalOpen} onClose={handleCloseModal}>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: "auto",
            width: "512px",
            height: "400px",
            padding: "20px",
            background: "#fff",
            borderRadius: "5px",
            boxShadow: "0 0 10px rgba(0,0,0,.3)",
          }}
        >
          <h2>Edit file: {selectedFile && selectedFile.name}</h2>
          <textarea
            style={{
              width: "100%",
              height: "300px",
              fontSize: "16px",
              lineHeight: "1.5",
              border: "1px solid #ccc",
              borderRadius: "5px",
              resize: "vertical",
            }}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          ></textarea>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button onClick={handleSave} style={{ marginRight: "10px" }}>
              Save
            </Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </div>
        </div>
      </Modal>


    </div>
  );
};

export default HomePage;