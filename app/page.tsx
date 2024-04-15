"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Divider,
  Input,
} from "@nextui-org/react";
import { states } from "@/lib/content/states";

interface State {
  stateName: string;
  conservative: number;
  beauty: number;
  cost: number;
  costal: boolean;
  averageTemp: number;
}

interface StateWithScore extends State {
  score: number;
}

const getColor = (value: number) => {
  const greenValue = 255 - Math.floor((value / 49) * 255);
  const redValue = Math.floor((value / 49) * 255);

  return `rgb(${redValue}, ${greenValue}, 0)`;
};

function OutOf50({ label, value, score }: Record<string, string | number>) {
  return (
    <div className="flex justify-between items-center">
      <p>
        <span className="font-bold">{label}: </span>
        <span
          style={{
            color: getColor(Number(value)),
          }}
        >
          #{value}
        </span>
        <span> out of 50</span>
      </p>
      <p>{score}</p>
    </div>
  );
}

function LabelAndValue({
  label,
  value,
  score,
}: Record<string, string | number | boolean>) {
  return (
    <div className="flex justify-between items-center">
      <p>
        <span className="font-bold">{label}: </span>
        {value}
      </p>
      <p>{score}</p>
    </div>
  );
}

const costalParam = "prioritize-costal";
const beautyParam = "prioritize-beauty";
const costParam = "prioritize-cost";
const conservativenessParam = "prioritize-conservativeness";
const averageTempParam = "prioritize-average-temp";
const bestAverageTempParam = "best-average-temp";

export default function Home() {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const costalPrioritized =
    searchParams.get(costalParam)?.toString() === "true";
  const beautyPrioritized =
    searchParams.get(beautyParam)?.toString() === "true";
  const costPrioritized = searchParams.get(costParam)?.toString() === "true";
  const conservativenessPrioritized =
    searchParams.get(conservativenessParam)?.toString() === "true";
  const averageTempPrioritized =
    searchParams.get(averageTempParam)?.toString() === "true";
  const bestAverageTemp =
    Number(searchParams.get(bestAverageTempParam)?.toString()) || 55;

  const [statesSorted, setStatesSorted] = useState<StateWithScore[]>([]);

  const flipHigher = (value: number) => 50 - value;

  const getFlippedValueScore = (value: number, prioritize: boolean) =>
    flipHigher(value) * (prioritize ? 2 : 1);
  const getAverageTempScore = (value: number) =>
    flipHigher(Math.abs(value - bestAverageTemp)) *
    (averageTempPrioritized ? 2 : 1);
  const getCostalScore = (value: boolean) =>
    (value ? 50 : 25) * (costalPrioritized ? 2 : 1);

  const getScore = (state: State) => {
    const { cost, beauty, conservative, averageTemp, costal } = state;
    const costScore = getFlippedValueScore(cost, costPrioritized);
    const beautyScore = getFlippedValueScore(beauty, beautyPrioritized);
    const conservativeScore = getFlippedValueScore(
      conservative,
      conservativenessPrioritized
    );
    const averageTempScore = getAverageTempScore(averageTemp);

    const costalScore = getCostalScore(costal);
    console.log(
      state.stateName,
      (costal ? 50 : 25) * (costalPrioritized ? 2 : 1)
    );

    return (
      costScore +
      beautyScore +
      conservativeScore +
      averageTempScore +
      costalScore
    );
  };

  useEffect(() => {
    const newStatesWithScores = states.map((state) => ({
      ...state,
      score: getScore(state),
    }));

    const newSortedStates = newStatesWithScores.sort((a, b) =>
      a.score > b.score ? -1 : 1
    );

    setStatesSorted(newSortedStates);
  }, [
    costPrioritized,
    beautyPrioritized,
    conservativenessPrioritized,
    averageTempPrioritized,
    costalPrioritized,
    bestAverageTemp,
  ]);

  function handleChange(param: string, value: boolean | string) {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(param, value.toString());
    } else {
      params.delete(param);
    }

    replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  return (
    <main className="flex flex-col mx-auto max-w-6xl p-6 gap-10 my-12">
      <h1>States Ranker</h1>
      <div className="flex flex-col gap-2 flex-wrap">
        <div className="mb-4">
          <h2>Priorities:</h2>
          <p>
            Select what parameters should have a greater affect on the final
            score.
          </p>
        </div>
        <Checkbox
          defaultSelected={costalPrioritized}
          onValueChange={(e) => handleChange(costalParam, e)}
        >
          Costal States
        </Checkbox>
        <Checkbox
          defaultSelected={costPrioritized}
          onValueChange={(e) => handleChange(costParam, e)}
        >
          Low Housing Cost
        </Checkbox>
        <Checkbox
          defaultSelected={beautyPrioritized}
          onValueChange={(e) => handleChange(beautyParam, e)}
        >
          Natural Beauty
        </Checkbox>
        <Checkbox
          defaultSelected={conservativenessPrioritized}
          onValueChange={(e) => handleChange(conservativenessParam, e)}
        >
          Conservativeness (Based on 2020 voter data)
        </Checkbox>
        <Checkbox
          defaultSelected={averageTempPrioritized}
          onValueChange={(e) => handleChange(averageTempParam, e)}
        >
          Average Temperate (Fahrenheit)
        </Checkbox>
        <div className="max-w-64">
          <Input
            min={20}
            max={80}
            type="number"
            defaultValue={bestAverageTemp.toString()}
            onValueChange={(e) => handleChange(bestAverageTempParam, e)}
            label="What is the best average Temp?"
          />
        </div>
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
        <div className="mb-4">
          <h2>Result:</h2>
        </div>
        <div className="flex justify-between px-4">
          <p>Data</p>
          <p>Score</p>
        </div>
        <div className="flex flex-col gap-8">
          {statesSorted.map(
            (
              {
                stateName,
                costal,
                conservative,
                cost,
                averageTemp,
                beauty,
                score,
              },
              index
            ) => (
              <Card key={stateName} className="bg-zinc-800">
                <CardHeader className="flex justify-between items-center">
                  <h2
                    className="truncate"
                    style={{
                      color: getColor(index),
                    }}
                  >
                    {stateName}
                  </h2>
                  <h3
                    className="truncate"
                    style={{
                      color: getColor(index),
                    }}
                  >
                    {score.toFixed(2)}
                  </h3>
                </CardHeader>
                <Divider />
                <CardBody>
                  <OutOf50
                    label="Conservativeness"
                    value={conservative}
                    score={getFlippedValueScore(
                      conservative,
                      conservativenessPrioritized
                    )}
                  />
                  <OutOf50
                    label="Housing Cost"
                    value={cost}
                    score={getFlippedValueScore(cost, costPrioritized)}
                  />
                  <div className="my-2" />
                  <div className="flex justify-between items-center">
                    <p>
                      <span className="font-bold">Is on the coast: </span>
                      <span
                        className={costal ? "text-blue-500" : "text-red-600"}
                      >
                        {costal.toString()}
                      </span>
                    </p>
                    <p>{getCostalScore(costal)}</p>
                  </div>
                  <OutOf50
                    label="Natural Beauty"
                    value={beauty}
                    score={getFlippedValueScore(beauty, beautyPrioritized)}
                  />
                  <LabelAndValue
                    label="Average Temperature (Fahrenheit)"
                    value={averageTemp}
                    score={getAverageTempScore(averageTemp)}
                  />
                </CardBody>
              </Card>
            )
          )}
        </div>
      </div>
    </main>
  );
}
