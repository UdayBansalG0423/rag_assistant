async function uploadPDF() {
    const fileInput = document.getElementById("pdfFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a PDF file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    document.getElementById("uploadStatus").innerText = data.status || data.error;
}

async function askQuestion() {
    const question = document.getElementById("question").value;

    if (!question) {
        alert("Enter a question.");
        return;
    }

    document.getElementById("loading").style.display = "block";

    const response = await fetch(`/ask?q=${encodeURIComponent(question)}`);
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    document.getElementById("result").innerHTML = `
        <p><strong>Answer:</strong> ${data.answer}</p>
        <p><strong>Sources:</strong> ${data.sources.join(", ")}</p>
        <p><strong>Latency:</strong> ${data.latency}s</p>
    `;
}