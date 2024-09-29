// -----JS CODE-----
// SingleclassClassificationController.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Script that determines emotion
// Allows to call corresponding callbacks

// @input Component.MLComponent mlComponent
//@input string Output = Output  {"hint": "Output placeholder name of your ML model asset"}
// @input int classIndex = 0 {"hint" : "This is an index of desired class in your neural network output"}
//@ui {"widget":"separator"}

// @input float threshold = 0.5  {"widget" : "slider" , "min" : "0", "max" : "1" ,"step" : "0.01", "hint": "If probability is bigger than this value - class is considered as found, if less - as lost"}
//@ui {"widget":"separator"}

//@ui {"label":"Callbacks"}
//@input Component.ScriptComponent[] scriptsWithCallbacks {"hint": "If these scripts have function script.onFound or script.onLost they will be called correspondingly"}

//@ui {"widget":"separator"}
// @input bool showDebug
// @input Component.ScriptComponent debugScoreBar {"showIf" : "showDebug"}

//@ui {"widget":"separator"}
// @input bool optional
//@input SceneObject loader {"showIf" : "optional"}

//@input SceneObject toggleObject1 // Object for output 1
//@input SceneObject toggleObject2 // Object for output 2
//@input SceneObject toggleObject3 // Object for output 3
//@input SceneObject toggleObject4 // Object for output 4
//@input SceneObject toggleObject5 // Object for output 5
//@input SceneObject toggleObject6 // Object for output 6
//@input SceneObject toggleObject7 // Object for output 7

var outputData;

if (checkInputs()) {
    print("Inputs checked successfully.");
    script.mlComponent.onLoadingFinished = wrapFunction(script.mlComponent.onLoadingFinished, onLoadingFinished);
}

function onUpdate() {
    try {
        if (!outputData) {
            debugPrint("Output data is not set yet.");
            return;
        }

        var p = outputData[script.classIndex]; // Get probability for the desired class

        if (p >= script.threshold) {
            onToggle(script.classIndex + 1); // Class found
        } else {
            onToggle(0); // Class lost
        }

        // Debugging
        if (script.showDebug && script.debugScoreBar && script.debugScoreBar.updateValue) {
            script.debugScoreBar.updateValue(p);
            debugPrint("Probabilities: " + JSON.stringify(outputData));
        }
    } catch (e) {
        debugPrint("Error in onUpdate: " + e);
    }
}

function onLoadingFinished() {
    try {
        debugPrint("ML model loading finished...");

        // Check if identity is set before proceeding
        if (!script.Output) {
            debugPrint("Identity is not set, skipping ML output retrieval.");
            return;  // Exit early if identity is null or undefined
        }

        var output;
        try {
            output = script.mlComponent.getOutput(script.Output);
            debugPrint("ML model output acquired: " + JSON.stringify(output)); 
        } catch (e) {
            debugPrint("Error in loading model output: " + e + ". Please check your model's output settings.");
            // Do not return; continue execution
        }

        // Check if output has the expected structure
        if (typeof output !== 'object' || !output || !output.data) {
            debugPrint("Error: Output is not an object or lacks 'data'.");
            // Continue execution
        } else {
            // Assuming output.data is an array containing the tensor
            if (Array.isArray(output.data) && output.data.length > 0) {
                outputData = output.data[0]; // Access the first tensor for the 7 emotion classes
                debugPrint("Output data ready: " + JSON.stringify(outputData));
            } else {
                debugPrint("Error: Output data is not in the expected format.");
                // Continue execution
            }
        }

        if (script.classIndex < 0 || script.classIndex >= (outputData ? outputData.length : 0)) {
            debugPrint("Error: Class index out of range.");
            // Continue execution
        }

        if (script.loader) {
            script.loader.enabled = false;
        }
        
        script.createEvent("UpdateEvent").bind(onUpdate);
    } catch (e) {
        debugPrint("Error in onLoadingFinished: " + e);
    }
}


function checkInputs() {
    try {
        if (!script.mlComponent) {
            debugPrint("Error, ML Component is not set");
            return false;
        }

        if (script.showDebug) {
            if (!script.debugScoreBar) {
                debugPrint("debugScoreBar is not set");
                return false;
            }
        } else if (script.debugScoreBar) {
            script.debugScoreBar.getSceneObject().enabled = false;
        }
        return true;
    } catch (e) {
        debugPrint("Error in checkInputs: " + e);
        return false;
    }
}

function debugPrint(text) {
    print("SingleclassClassificationHelper: " + text);
}

// Check if identity is assigned at the beginning of the script
try {
    if (script.Output) {
        debugPrint("Identity value: " + script.Output + " (Type: " + typeof script.Output + ")");
    } else {
        debugPrint("Identity is not set.");
    }
} catch (e) {
    debugPrint("Error during identity check: " + e);
}

// Helper function to wrap events
function wrapFunction(origFunc, newFunc) {
    if (!origFunc) {
        return newFunc;
    }
    return function() {
        try {
            origFunc();
        } catch (e) {
            debugPrint("Error in original function: " + e);
        }
        newFunc();
    };
}
