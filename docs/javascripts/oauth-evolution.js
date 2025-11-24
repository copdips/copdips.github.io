(function() {
  function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function renderOAuthEvolution(container, config) {
    const steps = config.steps || [];
    if (!steps.length) return;

    const wrapper = createElement("div", "oauth-evolution-wrapper");

    // Navigation container
    const nav = createElement("div", "oauth-evolution-nav");

    // Left arrow
    const leftArrow = createElement("button", "oauth-nav-arrow");
    leftArrow.innerHTML = "←";
    leftArrow.setAttribute("aria-label", "Previous flow");

    // Timeline container
    const timeline = createElement("div", "oauth-evolution-timeline");
    const timelineLine = createElement("div", "oauth-timeline-line");
    const timelineProgress = createElement("div", "oauth-timeline-progress");
    const timelineSteps = createElement("div", "oauth-timeline-steps");

    timeline.appendChild(timelineLine);
    timeline.appendChild(timelineProgress);
    timeline.appendChild(timelineSteps);

    // Right arrow
    const rightArrow = createElement("button", "oauth-nav-arrow");
    rightArrow.innerHTML = "→";
    rightArrow.setAttribute("aria-label", "Next flow");

    nav.appendChild(leftArrow);
    nav.appendChild(timeline);
    nav.appendChild(rightArrow);

    // Content area
    const content = createElement("div", "oauth-evolution-content");

    wrapper.appendChild(nav);
    wrapper.appendChild(content);
    container.appendChild(wrapper);

    let activeIndex = 0;

    function updateProgress() {
      const progress = steps.length > 1 ? (activeIndex / (steps.length - 1)) * 100 : 0;
      timelineProgress.style.width = progress + '%';
    }

    function updateArrows() {
      leftArrow.disabled = activeIndex === 0;
      rightArrow.disabled = activeIndex === steps.length - 1;
    }

    function renderStep(index, withAnimation = true) {
      activeIndex = index;
      const step = steps[index];
      if (!step) return;

      // Add transition class
      if (withAnimation) {
        content.classList.add('transitioning');
      }

      setTimeout(() => {
        // Update timeline dots
        Array.from(timelineSteps.children).forEach((dot, i) => {
          if (i === index) {
            dot.classList.add("active");
            dot.classList.remove("completed");
          } else if (i < index) {
            dot.classList.remove("active");
            dot.classList.add("completed");
          } else {
            dot.classList.remove("active", "completed");
          }
        });

        updateProgress();
        updateArrows();

        // Clear and render content
        content.innerHTML = "";

        // Title
        const title = createElement("h3", "oauth-flow-title", step.title);
        content.appendChild(title);

        // Comparison badge if available
        if (step.comparedTo) {
          const comparisonDiv = document.createElement("div");
          comparisonDiv.style.textAlign = "center";
          const comparison = createElement("div", "oauth-comparison",
            `Evolution from: ${step.comparedTo}`);
          comparisonDiv.appendChild(comparison);
          content.appendChild(comparisonDiv);
        }

        // Render sequence diagram
        if (step.actors && step.interactions) {
          const diagram = renderSequenceDiagram(step);
          content.appendChild(diagram);
        }

        // Key improvement
        if (step.keyImprovement) {
          const improvement = createElement("div", "oauth-key-improvement");
          const improvementTitle = createElement("div", "oauth-key-improvement-title",
            "Key Security Improvement in " + step.title);
          const improvementText = createElement("div", "oauth-key-improvement-text",
            step.keyImprovement);
          improvement.appendChild(improvementTitle);
          improvement.appendChild(improvementText);
          content.appendChild(improvement);
        }

        // Remove transition class
        if (withAnimation) {
          content.classList.remove('transitioning');
        }
      }, withAnimation ? 150 : 0);
    }

    function renderSequenceDiagram(step) {
      const diagram = createElement("div", "oauth-sequence-diagram");

      // Actors
      const actorsContainer = createElement("div", "oauth-actors");
      const actorElements = {};

      step.actors.forEach((actorName, index) => {
        const actor = createElement("div", "oauth-actor");
        const actorBox = createElement("div", "oauth-actor-box", actorName);
        const lifeline = createElement("div", "oauth-lifeline");

        actor.appendChild(actorBox);
        actor.appendChild(lifeline);
        actorsContainer.appendChild(actor);

        actorElements[actorName] = { element: actor, index: index };
      });

      diagram.appendChild(actorsContainer);

      // Interactions
      const interactionsContainer = createElement("div", "oauth-interactions");

      step.interactions.forEach((interaction, interactionIndex) => {
        const interactionDiv = createElement("div", "oauth-interaction");

        if (interaction.highlight) {
          interactionDiv.classList.add("highlight");
        } else if (interaction.improvement) {
          interactionDiv.classList.add("improvement");
        } else if (interaction.fixes) {
          interactionDiv.classList.add("fixed");
        }

        // Add step number badge
        const stepNumber = createElement("div", "oauth-step-number", (interactionIndex + 1).toString());
        interactionDiv.appendChild(stepNumber);

        // Calculate arrow position
        const fromIndex = actorElements[interaction.from].index;
        const toIndex = actorElements[interaction.to].index;
        const numActors = step.actors.length;

        // Arrow
        const arrow = createElement("div", "oauth-arrow");
        if (toIndex < fromIndex) {
          arrow.classList.add("reverse");
        }

        // Store indices for later positioning adjustment
        arrow.dataset.fromIndex = fromIndex;
        arrow.dataset.toIndex = toIndex;
        arrow.dataset.numActors = numActors;

        // Initial positioning (will be adjusted after render)
        const actorWidth = 100 / numActors;
        const fromPos = (fromIndex + 0.5) * actorWidth;
        const toPos = (toIndex + 0.5) * actorWidth;

        if (toIndex > fromIndex) {
          arrow.style.left = fromPos + '%';
          arrow.style.width = (toPos - fromPos) + '%';
        } else {
          arrow.style.left = toPos + '%';
          arrow.style.width = (fromPos - toPos) + '%';
        }

        // Arrow label with step number
        const labelText = (interactionIndex + 1) + '. ' + interaction.message;
        const label = createElement("div", "oauth-arrow-label", labelText);
        arrow.appendChild(label);

        interactionDiv.appendChild(arrow);

        // Add warning note if present
        if (interaction.warning) {
          const warningNote = createElement("div", "oauth-warning-note");
          const warningTitle = createElement("div", "oauth-warning-note-title", "Security Risk");
          const warningText = document.createTextNode(interaction.warning);

          warningNote.appendChild(warningTitle);
          warningNote.appendChild(warningText);
          interactionDiv.appendChild(warningNote);

          // Add animation delay
          warningNote.style.animationDelay = (0.2 + interactionIndex * 0.15 + 0.2) + 's';
        }

        // Add fixed note if present
        if (interaction.fixes) {
          const fixedNote = createElement("div", "oauth-fixed-note");
          const fixedTitle = createElement("div", "oauth-fixed-note-title", "Fixed!");
          const fixedText = document.createTextNode(interaction.fixes);

          fixedNote.appendChild(fixedTitle);
          fixedNote.appendChild(fixedText);
          interactionDiv.appendChild(fixedNote);

          // Add animation delay
          fixedNote.style.animationDelay = (0.2 + interactionIndex * 0.15 + 0.2) + 's';
        }

        interactionsContainer.appendChild(interactionDiv);
      });

      diagram.appendChild(interactionsContainer);

      // Fix lifeline heights and arrow positions after rendering
      setTimeout(() => {
        const diagramHeight = diagram.offsetHeight;
        const actorsHeight = actorsContainer.offsetHeight;
        const lifelineHeight = diagramHeight - actorsHeight;

        actorsContainer.querySelectorAll('.oauth-lifeline').forEach(lifeline => {
          lifeline.style.height = lifelineHeight + 'px';
        });

        // Adjust arrow positions to align with lifelines using absolute pixel positions
        const interactionsContainer = diagram.querySelector('.oauth-interactions');
        const interactionsLeft = interactionsContainer.getBoundingClientRect().left;
        const interactionsWidth = interactionsContainer.offsetWidth;

        // Get actor positions
        const actors = actorsContainer.querySelectorAll('.oauth-actor');

        diagram.querySelectorAll('.oauth-arrow').forEach(arrow => {
          const fromIndex = parseInt(arrow.dataset.fromIndex);
          const toIndex = parseInt(arrow.dataset.toIndex);

          // Get the center position of each actor
          const fromActor = actors[fromIndex];
          const toActor = actors[toIndex];
          const fromActorRect = fromActor.getBoundingClientRect();
          const toActorRect = toActor.getBoundingClientRect();

          const fromActorCenter = fromActorRect.left + fromActorRect.width / 2;
          const toActorCenter = toActorRect.left + toActorRect.width / 2;

          // Convert to percentage of interactions container
          const fromPos = ((fromActorCenter - interactionsLeft) / interactionsWidth) * 100;
          const toPos = ((toActorCenter - interactionsLeft) / interactionsWidth) * 100;

          if (toIndex > fromIndex) {
            arrow.style.left = fromPos + '%';
            arrow.style.width = (toPos - fromPos) + '%';
          } else {
            arrow.style.left = toPos + '%';
            arrow.style.width = (fromPos - toPos) + '%';
          }
        });
      }, 50);

      return diagram;
    }

    // Create timeline dots
    steps.forEach((step, index) => {
      const timelineStep = createElement("div", "oauth-timeline-step");

      // Mark first 3 flows as deprecated
      if (index < 3) {
        timelineStep.classList.add("deprecated");
      }

      const dot = createElement("div", "oauth-timeline-dot", (index + 1).toString());
      const label = createElement("div", "oauth-timeline-label", step.label);
      const fullTitle = createElement("div", "oauth-timeline-full-title", step.title);

      timelineStep.appendChild(dot);
      timelineStep.appendChild(label);
      timelineStep.appendChild(fullTitle);

      timelineStep.addEventListener("click", () => {
        renderStep(index);
      });

      timelineSteps.appendChild(timelineStep);
    });

    // Arrow navigation
    leftArrow.addEventListener("click", () => {
      if (activeIndex > 0) {
        renderStep(activeIndex - 1);
      }
    });

    rightArrow.addEventListener("click", () => {
      if (activeIndex < steps.length - 1) {
        renderStep(activeIndex + 1);
      }
    });

    // Keyboard navigation
    wrapper.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        renderStep(activeIndex - 1);
      } else if (e.key === "ArrowRight" && activeIndex < steps.length - 1) {
        renderStep(activeIndex + 1);
      }
    });

    // Initial render
    renderStep(0, false);
  }

  function initAll() {
    document.querySelectorAll(".oauth-evolution").forEach(container => {
      try {
        const script = container.querySelector("script[type='application/json']");
        if (!script) return;
        const config = JSON.parse(script.textContent);
        container.innerHTML = "";
        renderOAuthEvolution(container, config);
      } catch (e) {
        console.error("Error initializing oauth-evolution:", e);
      }
    });
  }

  // Initialize on page load
  if (document.readyState !== "loading") {
    initAll();
  } else {
    document.addEventListener("DOMContentLoaded", initAll);
  }

  // Support MkDocs Material instant loading
  document.addEventListener("DOMContentLoaded", initAll);
  document.addEventListener("readystatechange", function() {
    if (document.readyState === "complete") {
      initAll();
    }
  });

  // MkDocs Material navigation hook
  if (typeof document$ !== 'undefined') {
    document$.subscribe(() => {
      setTimeout(initAll, 100);
    });
  }
})();
