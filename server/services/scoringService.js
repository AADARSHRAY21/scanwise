function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getProductInsight(nutrition) {
  const scoreFactors = [];
  let score = 100;

  const sugars = numberOrNull(nutrition.sugars);
  const saturatedFat = numberOrNull(nutrition.saturatedFat);
  const sodium = numberOrNull(nutrition.sodium);
  const fiber = numberOrNull(nutrition.fiber);
  const protein = numberOrNull(nutrition.protein);

  if (sugars !== null) {
    if (sugars >= 22.5) {
      score -= 25;
      scoreFactors.push({ tone: "limit", text: `High sugar: ${sugars} g per 100 g.` });
    } else if (sugars >= 10) {
      score -= 15;
      scoreFactors.push({ tone: "limit", text: `Moderate sugar: ${sugars} g per 100 g.` });
    }
  }

  if (saturatedFat !== null) {
    if (saturatedFat >= 5) {
      score -= 20;
      scoreFactors.push({ tone: "limit", text: `High saturated fat: ${saturatedFat} g per 100 g.` });
    } else if (saturatedFat >= 1.5) {
      score -= 10;
      scoreFactors.push({ tone: "limit", text: `Moderate saturated fat: ${saturatedFat} g per 100 g.` });
    }
  }

  if (sodium !== null) {
    if (sodium >= 0.6) {
      score -= 15;
      scoreFactors.push({ tone: "limit", text: `High sodium: ${sodium} g per 100 g.` });
    } else if (sodium >= 0.12) {
      score -= 8;
      scoreFactors.push({ tone: "limit", text: `Moderate sodium: ${sodium} g per 100 g.` });
    }
  }

  if (fiber !== null) {
    if (fiber >= 6) {
      score += 10;
      scoreFactors.push({ tone: "positive", text: `High fibre: ${fiber} g per 100 g.` });
    } else if (fiber >= 3) {
      score += 5;
      scoreFactors.push({ tone: "positive", text: `Contains fibre: ${fiber} g per 100 g.` });
    }
  }

  if (protein !== null && protein >= 12.5) {
    score += 5;
    scoreFactors.push({ tone: "positive", text: `Good protein content: ${protein} g per 100 g.` });
  }

  score = Math.max(0, Math.min(100, score));

  let label = "Better choice";
  let summary = "Its listed nutrition values have relatively few flagged factors.";

  if (score < 40) {
    label = "Consider limiting";
    summary = "Several listed nutrition values are worth keeping in mind.";
  } else if (score < 70) {
    label = "Mixed choice";
    summary = "It has a mix of positive and less favourable nutrition factors.";
  }

  if (scoreFactors.length === 0) {
    scoreFactors.push({
      tone: "neutral",
      text: "Not enough listed nutrition values were available for a detailed breakdown.",
    });
  }

  return { score, label, summary, scoreFactors };
}

module.exports = { getProductInsight };
