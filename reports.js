/**
 * REPORTS & CERTIFICATES GENERATOR MODULE (WITH QR CODE VERIFICATION)
 */

class ReportsModule {
  static init() {
    this.tabButtons = document.querySelectorAll(".report-tab-btn");
    this.monthSelect = document.getElementById("reportMonthSelect");
    this.studentSelect = document.getElementById("reportStudentSelect");
    this.studentSelectWrapper = document.getElementById("reportStudentSelectWrapper");
    this.certRankSelect = document.getElementById("reportCertRankSelect");
    this.certRankWrapper = document.getElementById("reportCertRankWrapper");
    this.printBtn = document.getElementById("printActiveReportBtn");
    this.confettiBtn = document.getElementById("celebrateConfettiBtn");

    this.currentReport = "honor-roll";

    this.bindEvents();
    this.populateStudentDropdown();
    this.render();
  }

  static bindEvents() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentReport = btn.dataset.report;
        this.handleReportTypeChange();
        this.render();
      });
    });

    if (this.monthSelect) {
      this.monthSelect.addEventListener("change", () => this.render());
    }
    if (this.studentSelect) {
      this.studentSelect.addEventListener("change", () => this.render());
    }
    if (this.certRankSelect) {
      this.certRankSelect.addEventListener("change", () => this.render());
    }
    if (this.printBtn) {
      this.printBtn.addEventListener("click", () => window.print());
    }
    if (this.confettiBtn) {
      this.confettiBtn.addEventListener("click", () => this.triggerConfetti());
    }
  }

  static populateStudentDropdown() {
    if (!this.studentSelect) return;
    const students = StorageManager.getStudents();
    this.studentSelect.innerHTML = students.map(st => `
      <option value="${st.id}">${st.nameKh} (${st.id})</option>
    `).join("");
  }

  static handleReportTypeChange() {
    if (this.studentSelectWrapper) {
      this.studentSelectWrapper.style.display = this.currentReport === "student-bulletin" ? "flex" : "none";
    }
    if (this.certRankWrapper) {
      this.certRankWrapper.style.display = this.currentReport === "certificate" ? "flex" : "none";
    }

    document.getElementById("reportPaperHonor").style.display = this.currentReport === "honor-roll" ? "block" : "none";
    document.getElementById("reportPaperTranscript").style.display = this.currentReport === "full-transcript" ? "block" : "none";
    document.getElementById("reportPaperBulletin").style.display = this.currentReport === "student-bulletin" ? "block" : "none";
    document.getElementById("reportPaperCert").style.display = this.currentReport === "certificate" ? "block" : "none";
  }

  static triggerConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  static getPeriodText(periodKey) {
    const map = {
      "month_10": "ខែ តុលា",
      "month_11": "ខែ វិច្ឆិកា",
      "month_12": "ខែ ធ្នូ",
      "month_01": "ខែ មករា",
      "sem_1": "ឆមាសទី ១",
      "month_02": "ខែ កុម្ភៈ",
      "month_03": "ខែ មីនា",
      "month_04": "ខែ មេសា",
      "month_05": "ខែ ឧសភា",
      "sem_2": "ឆមាសទី ២",
      "yearly": "ប្រចាំឆ្នាំ"
    };
    return map[periodKey] || "ខែ តុលា";
  }

  static render() {
    const period = this.monthSelect ? this.monthSelect.value : "month_10";
    const periodText = this.getPeriodText(period);
    const school = StorageManager.getSchoolInfo();
    const results = GradesModule.getCalculatedResults(period);

    // 1. Render Honor Roll
    this.renderHonorRoll(periodText, school, results);

    // 2. Render Full Transcript Sheet
    this.renderFullTranscript(periodText, school, results);

    // 3. Render Student Bulletin
    this.renderStudentBulletin(periodText, school, results);

    // 4. Render Certificate
    this.renderCertificate(periodText, school, results);
  }

  static renderHonorRoll(periodText, school, results) {
    document.getElementById("rptHonorSchoolName").textContent = school.schoolName;
    document.getElementById("rptHonorClassName").textContent = "៨ A";
    document.getElementById("rptHonorMonthTitle").textContent = `ប្រចាំ${periodText} ឆ្នាំសិក្សា ${school.academicYear}`;
    document.getElementById("rptHonorPrincipalName").textContent = school.principalName;
    document.getElementById("rptHonorTeacherName").textContent = school.teacherName;
    document.getElementById("rptHonorDateSigned").textContent = `រាជធានីភ្នំពេញ, ថ្ងៃទី ០៩ ${periodText} ឆ្នាំ ២០២៥`;

    const sorted = [...results].sort((a, b) => b.total - a.total);
    const top3 = sorted.slice(0, 3);
    const top10 = sorted.slice(0, 10);

    // Podium
    const podiumEl = document.getElementById("honorPodiumCards");
    if (podiumEl && top3.length >= 3) {
      podiumEl.innerHTML = `
        <!-- Rank 2 -->
        <div class="podium-card podium-rank-2">
          <div class="podium-crown">🥈</div>
          <img src="${top3[1].student.photo || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + top3[1].student.id}" class="podium-photo" alt="">
          <div class="podium-name">${top3[1].student.nameKh}</div>
          <div class="podium-score">មធ្យមភាគ៖ ${top3[1].average.toFixed(2)}</div>
          <div class="podium-mention">និទ្ទេស ${top3[1].mention} (ចំណាត់ថ្នាក់លេខ ២)</div>
        </div>

        <!-- Rank 1 (Center Highlight) -->
        <div class="podium-card podium-rank-1">
          <div class="podium-crown">👑 🥇</div>
          <img src="${top3[0].student.photo || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + top3[0].student.id}" class="podium-photo" alt="">
          <div class="podium-name">${top3[0].student.nameKh}</div>
          <div class="podium-score">មធ្យមភាគ៖ ${top3[0].average.toFixed(2)}</div>
          <div class="podium-mention">និទ្ទេស ${top3[0].mention} (ចំណាត់ថ្នាក់លេខ ១)</div>
        </div>

        <!-- Rank 3 -->
        <div class="podium-card podium-rank-3">
          <div class="podium-crown">🥉</div>
          <img src="${top3[2].student.photo || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + top3[2].student.id}" class="podium-photo" alt="">
          <div class="podium-name">${top3[2].student.nameKh}</div>
          <div class="podium-score">មធ្យមភាគ៖ ${top3[2].average.toFixed(2)}</div>
          <div class="podium-mention">និទ្ទេស ${top3[2].mention} (ចំណាត់ថ្នាក់លេខ ៣)</div>
        </div>
      `;
    }

    // Top 10 Table
    const tableBody = document.getElementById("rptHonorTableBody");
    if (tableBody) {
      tableBody.innerHTML = top10.map((res, idx) => `
        <tr>
          <td><strong class="text-primary font-bold">លេខ ${idx + 1}</strong></td>
          <td>${res.student.id}</td>
          <td style="text-align: left; font-weight: 700;">${res.student.nameKh}</td>
          <td>${res.student.gender}</td>
          <td>${res.student.dob}</td>
          <td>${res.total.toFixed(1)}</td>
          <td><strong>${res.average.toFixed(2)}</strong></td>
          <td><span class="mention-badge ${res.mentionClass}">${res.mention}</span></td>
          <td>${idx === 0 ? 'កិត្តិយសលេខ ១' : idx < 3 ? 'សិស្សឆ្នើម' : 'សរសើរការសិក្សា'}</td>
        </tr>
      `).join("");
    }
  }

  static renderFullTranscript(periodText, school, results) {
    document.getElementById("rptTransSchoolName").textContent = school.schoolName;
    document.getElementById("rptTransClassName").textContent = "៨ A";
    document.getElementById("rptTransMonthTitle").textContent = `ប្រចាំ${periodText} ឆ្នាំសិក្សា ${school.academicYear}`;
    document.getElementById("rptTransPrincipalName").textContent = school.principalName;
    document.getElementById("rptTransTeacherName").textContent = school.teacherName;
    document.getElementById("rptTransDateSigned").textContent = `រាជធានីភ្នំពេញ, ថ្ងៃទី ០៩ ${periodText} ឆ្នាំ ២០២៥`;

    const subjects = StorageManager.getSubjects();
    const tbody = document.getElementById("rptFullTranscriptBody");

    let passCount = 0;
    let femalePassCount = 0;
    let femaleTotal = 0;

    if (tbody) {
      tbody.innerHTML = results.map((res, idx) => {
        const st = res.student;
        if (st.gender === "ស្រី") femaleTotal++;
        if (res.isPassed) {
          passCount++;
          if (st.gender === "ស្រី") femalePassCount++;
        }

        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${st.id}</td>
            <td style="text-align: left; font-weight: 700;">${st.nameKh}</td>
            <td>${st.gender}</td>
            ${subjects.map(s => `<td>${res.subjectScores[s.id] || 0}</td>`).join("")}
            <td><strong>${res.total.toFixed(1)}</strong></td>
            <td><strong>${res.average.toFixed(2)}</strong></td>
            <td>${res.mention}</td>
            <td><strong>${res.rank}</strong></td>
            <td>${res.isPassed ? 'ជាប់' : 'ធ្លាក់'}</td>
          </tr>
        `;
      }).join("");
    }

    // Statistics grid
    const totalStudents = results.length || 1;
    const maleTotal = totalStudents - femaleTotal;
    const malePassCount = passCount - femalePassCount;
    const passPercentage = ((passCount / totalStudents) * 100).toFixed(1);

    const statsGrid = document.getElementById("rptTransStatsGrid");
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div style="margin-top: 15px; padding: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; display: flex; justify-content: space-between;">
          <div><strong>សិស្សក្នុងបញ្ជី៖</strong> ${totalStudents} នាក់ (ស្រី ${femaleTotal} នាក់ / ប្រុស ${maleTotal} នាក់)</div>
          <div><strong>សិស្សជាប់ (>=25)៖</strong> ${passCount} នាក់ (ស្រី ${femalePassCount} នាក់ / ប្រុស ${malePassCount} នាក់)</div>
          <div><strong>អត្រាជាប់មធ្យម៖</strong> ${passPercentage}%</div>
        </div>
      `;
    }
  }

  static renderStudentBulletin(periodText, school, results) {
    const studentId = this.studentSelect ? this.studentSelect.value : (results[0] ? results[0].student.id : "");
    const res = results.find(r => r.student.id === studentId) || results[0];
    if (!res) return;

    const st = res.student;
    const subjects = StorageManager.getSubjects();

    document.getElementById("rptBulSchoolName").textContent = school.schoolName;
    document.getElementById("rptBulPeriodTitle").textContent = `ប្រចាំ${periodText} ឆ្នាំសិក្សា ${school.academicYear}`;
    document.getElementById("rptBulStudentPhoto").src = st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`;
    document.getElementById("rptBulStudentName").textContent = st.nameKh;
    document.getElementById("rptBulStudentLatin").textContent = st.nameEn;
    document.getElementById("rptBulStudentID").textContent = st.id;
    document.getElementById("rptBulStudentGender").textContent = st.gender;
    document.getElementById("rptBulStudentDob").textContent = st.dob;
    
    const fatherText = st.fatherName 
      ? `${st.fatherName} ${st.fatherJob ? `(${st.fatherJob})` : ''}`
      : (st.parentName || "-");
    const motherText = st.motherName 
      ? `${st.motherName} ${st.motherJob ? `(${st.motherJob})` : ''}`
      : "-";

    const pobDisplay = (typeof StudentsModule !== "undefined" && StudentsModule.formatPob)
      ? StudentsModule.formatPob(st)
      : (st.pob || "រាជធានីភ្នំពេញ");
    const addrDisplay = (typeof StudentsModule !== "undefined" && StudentsModule.formatCurAddress)
      ? StudentsModule.formatCurAddress(st)
      : (st.address || "រាជធានីភ្នំពេញ");
    const phoneDisplay = st.studentPhone
      ? `${st.studentPhone} (សិស្ស) / ${st.parentPhone || ''}`
      : (st.parentPhone || "-");

    const pobEl = document.getElementById("rptBulPobInfo");
    if (pobEl) pobEl.textContent = pobDisplay;
    const addrEl = document.getElementById("rptBulAddressInfo");
    if (addrEl) addrEl.textContent = addrDisplay;
    const phoneEl = document.getElementById("rptBulPhoneInfo");
    if (phoneEl) phoneEl.textContent = phoneDisplay;

    const fatherEl = document.getElementById("rptBulFatherInfo");
    if (fatherEl) fatherEl.textContent = fatherText;
    const motherEl = document.getElementById("rptBulMotherInfo");
    if (motherEl) motherEl.textContent = motherText;

    const rowsBody = document.getElementById("rptBulSubjectRows");
    if (rowsBody) {
      rowsBody.innerHTML = subjects.map((sub, idx) => {
        const score = res.subjectScores[sub.id] || 0;
        const subAvg = sub.maxScore === 100 ? (score / 2).toFixed(2) : score.toFixed(2);
        const subEval = GradesModule.getEvaluation(parseFloat(subAvg));

        return `
          <tr>
            <td>${idx + 1}</td>
            <td style="text-align: left; font-weight: 700;">${sub.name} (${sub.nameEn})</td>
            <td>${sub.maxScore}</td>
            <td><strong>${score}</strong></td>
            <td>${subAvg}</td>
            <td><span class="mention-badge ${subEval.class}">${subEval.mention}</span></td>
            <td>-</td>
          </tr>
        `;
      }).join("");
    }

    document.getElementById("rptBulTotalScore").textContent = res.total.toFixed(2);
    document.getElementById("rptBulAverageScore").textContent = res.average.toFixed(2);
    document.getElementById("rptBulOverallMention").textContent = `${res.mention} (${res.mentionLabel})`;
    document.getElementById("rptBulOverallRank").textContent = `ចំណាត់ថ្នាក់លេខ ${res.rank} / ${results.length}`;
    document.getElementById("rptBulTeacherName").textContent = school.teacherName;
    document.getElementById("rptBulDateSigned").textContent = `រាជធានីភ្នំពេញ, ថ្ងៃទី ០៩ ${periodText} ឆ្នាំ ២០២៥`;

    // Dynamic QR Code for Student Bulletin
    const qrContainer = document.getElementById("rptBulQrCodeBox");
    if (qrContainer) {
      qrContainer.innerHTML = "";
      if (typeof QRCode !== "undefined") {
        new QRCode(qrContainer, {
          text: `https://moeys.gov.kh/verify?student=${st.id}&avg=${res.average}&rank=${res.rank}`,
          width: 70,
          height: 70,
          colorDark: "#1e3a8a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }
  }

  static renderCertificate(periodText, school, results) {
    const rankMode = this.certRankSelect ? this.certRankSelect.value : "top1";
    const sorted = [...results].sort((a, b) => b.total - a.total);

    let targetStudentRes = sorted[0]; // Default Rank 1
    if (rankMode === "top2" && sorted[1]) targetStudentRes = sorted[1];
    else if (rankMode === "top3" && sorted[2]) targetStudentRes = sorted[2];
    
    if (!targetStudentRes) return;
    const st = targetStudentRes.student;

    document.getElementById("certSchoolName").textContent = school.schoolName;
    document.getElementById("certStudentName").textContent = `យុវសិស្ស ${st.nameKh}`;
    document.getElementById("certStudentLatin").textContent = st.nameEn;
    document.getElementById("certStudentGender").textContent = st.gender;
    document.getElementById("certStudentClass").textContent = st.class || "៨ A";
    document.getElementById("certStudentID").textContent = st.id;
    document.getElementById("certRankHighlight").textContent = `ចំណាត់ថ្នាក់លេខ ${targetStudentRes.rank}`;
    document.getElementById("certPeriodText").textContent = `${periodText} ឆ្នាំសិក្សា ${school.academicYear}`;
    document.getElementById("certAverageText").textContent = `${targetStudentRes.average.toFixed(2)} / 50`;
    document.getElementById("certMentionText").textContent = `${targetStudentRes.mention} - ${targetStudentRes.mentionLabel}`;
    document.getElementById("certPrincipalName").textContent = school.principalName;
    document.getElementById("certTeacherName").textContent = school.teacherName;
    document.getElementById("certDateSigned").textContent = `រាជធានីភ្នំពេញ, ថ្ងៃទី ០៩ ${periodText} ឆ្នាំ ២០២៥`;
  }
}
