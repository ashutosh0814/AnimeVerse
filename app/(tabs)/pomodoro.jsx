import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";

const Pomodoro = () => {
  const workTime = 60 * 60; // 60 minutes in seconds
  const breakTime = 25 * 60; // 25 minutes in seconds
  const [time, setTime] = useState(workTime);
  const [isRunning, setIsRunning] = useState(false);
  const [loop, setLoop] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [progress, setProgress] = useState(1);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            if (loop) {
              setIsBreak(!isBreak);
              return isBreak ? workTime : breakTime;
            } else {
              clearInterval(intervalRef.current);
              setIsRunning(false);
              return 0;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, loop, breakTime, workTime, isBreak]);

  useEffect(() => {
    const total = isBreak ? breakTime : workTime;
    setProgress(time / total);
  }, [time, breakTime, workTime, isBreak]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleAbort = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(workTime);
    setIsBreak(false);
    setProgress(1);
  };

  return (
    <SafeAreaView className="h-full w-full">
      <ImageBackground
        source={require("../../assets/images/pattern.jpg")}
        className="flex-1 justify-center"
      >
        <View className="flex-1 items-center justify-center p-4">
          <View className="items-center justify-center">
            <Text className="absolute text-2xl text-green-900 font-pbold top-4">
              {isBreak ? "Work time: 60 minutes" : "Break time: 25 minutes"}
            </Text>
            <Svg className="mt-12" height="300" width="300">
              <G rotation="-90" origin="150, 150">
                <Circle
                  cx="150"
                  cy="150"
                  r="130"
                  stroke="green"
                  strokeWidth="15"
                  fill="transparent"
                  strokeOpacity={1}
                />
                <Circle
                  cx="150"
                  cy="150"
                  r="130"
                  stroke={isBreak ? "#FA7070" : "#A1DD70"}
                  strokeWidth="15"
                  strokeDasharray="817"
                  strokeDashoffset={817 * progress}
                  fill="transparent"
                  strokeOpacity={1}
                />
              </G>
            </Svg>
            <Text className="absolute text-4xl font-psemibold text-white">
              {formatTime(time)}
            </Text>
          </View>
          <View className="mt-4 w-full items-center">
            <TouchableOpacity
              onPress={() => setIsRunning(!isRunning)}
              className="bg-blue-500 p-4 rounded mt-2 w-48 items-center"
            >
              <Text className="text-white text-lg font-bold">
                {isRunning ? "Pause" : "Start"}
              </Text>
            </TouchableOpacity>
            {isRunning && (
              <TouchableOpacity
                onPress={handleAbort}
                className="bg-red-500 p-4 rounded mt-2 w-48 items-center"
              >
                <Text className="text-white text-lg font-bold">Abort</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setLoop(!loop)}
              className={`p-4 rounded mt-2 w-48 items-center ${
                loop ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              <Text className="text-white text-lg font-bold">
                {loop ? "Loop On" : "Loop Off"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Pomodoro;
