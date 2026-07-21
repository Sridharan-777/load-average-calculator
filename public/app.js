const form = document.querySelector("#load-form");
const result = document.querySelector("#result");
const errorMessage = document.querySelector("#error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";
  result.hidden = true;

  const loads = document.querySelector("#loads").value
    .split(",")
    .map((value) => Number(value.trim()));
  const cpuCores = Number(document.querySelector("#cores").value);

  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loads, cpuCores }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    document.querySelector("#average").textContent = data.average;
    document.querySelector("#minimum").textContent = data.minimum;
    document.querySelector("#maximum").textContent = data.maximum;
    document.querySelector("#utilization").textContent = `${data.utilization}%`;
    document.querySelector("#status").textContent = data.status;
    result.hidden = false;
  } catch (error) {
    errorMessage.textContent = error.message || "Unable to calculate the load average.";
  }
});

