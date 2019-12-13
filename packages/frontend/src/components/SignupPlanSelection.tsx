import _ from "lodash";
import { useRouter } from "next/router";
import React, { FC, useLayoutEffect, useRef, useState } from "react";
import { Button, useTranslate } from "@bitbloq/ui";
import styled from "@emotion/styled";
import PlanOption from "./PlanOption";
import { plans, signupSteps } from "../config";
import { IPlan } from "../types";

interface ISignupPlanSelectionProps {
  defaultValues: IPlan;
  isAMinor: boolean;
  loading: boolean;
  onSubmit: (userInputs: IPlan) => void;
}

const SignupPlanSelection: FC<ISignupPlanSelectionProps> = ({
  defaultValues,
  isAMinor,
  loading,
  onSubmit
}) => {
  const router = useRouter();
  const t = useTranslate();
  const memberPlan = plans.filter(p => p.name === "member")[0];
  const teacherPlan = plans.filter(p => p.name === "teacher")[0];

  const [plan, setPlan] = useState(defaultValues);
  const submitRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const onSubmitForm = (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        submitRef.current!.click();
      }
    };
    window.addEventListener("keypress", onSubmitForm);
    return () => window.removeEventListener("keypress", onSubmitForm);
  }, []);

  return (
    <>
      {t("signup.plan-selection.sub-title")}
      <PlanOption
        checked={plan === memberPlan}
        onClick={() => setPlan(memberPlan)}
        plan={memberPlan}
      />
      <PlanOption
        checked={plan === teacherPlan}
        disabled={isAMinor}
        onClick={() => setPlan(teacherPlan)}
        plan={teacherPlan}
        showFeatures={true}
      />
      <Buttons>
        <Button
          tertiary
          onClick={() =>
            router.push("/signup/[step]", `/signup/${_.first(signupSteps)}`, {
              shallow: true
            })
          }
        >
          {t("signup.plan-selection.cancel")}
        </Button>
        <Button
          ref={submitRef}
          disabled={loading}
          onClick={() => onSubmit(plan)}
        >
          {t("signup.plan-selection.ok")}
        </Button>
      </Buttons>
    </>
  );
};

export default SignupPlanSelection;

/* Styled components */

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
`;
