
export function redactSensitiveAttributes(body: any[], sensitiveAttributes: string[] ): any[] {

    let taskAttributesStr = body[0]?.data?.payload?.task_attributes;
  
    if (taskAttributesStr) {
        try {
            // Parse task_attributes string into an object
            let taskAttributes = JSON.parse(taskAttributesStr);
  
            // Iterate over the list of sensitive attributes
            sensitiveAttributes.forEach((attr) => {
                if (taskAttributes[attr] && typeof taskAttributes[attr] === 'string') {
                    const value = taskAttributes[attr];
                    const redactedValue = value.length > 4 ? `XXXXX${value.slice(-4)}` : "XXXXX";
                    taskAttributes[attr] = redactedValue;
                }
            });
  
            // Convert the modified object back to a string
            body[0].data.payload.task_attributes = JSON.stringify(taskAttributes);
  
        } catch (error) {
            console.error("Error parsing task_attributes:", error);
        }
    }
    
    // Return the updated body
    return body;
  }
 export function removeAttributes(body: any[], attributesToRemove: string[], nestedAttributesToKeep: Record<string, string[]>): any[] {
    // Check if body[0] and necessary attributes exist
    let taskAttributesStr = body[0]?.data?.payload?.task_attributes;
  
    if (taskAttributesStr) {
        try {
            // Parse task_attributes string into an object
            let taskAttributes = JSON.parse(taskAttributesStr);
  
            // Loop over attributesToRemove and delete them if they exist in taskAttributes
            attributesToRemove.forEach(attr => {
                // Check if attribute exists in taskAttributes
                //console.log(`Checking if ${attr} exists in taskAttributes`);
                if (taskAttributes.hasOwnProperty(attr)) {
                  //  console.log(`Deleting ${attr} from taskAttributes`);
                    const originalValue = taskAttributes[attr];
                    delete taskAttributes[attr];
                    const toKeep = nestedAttributesToKeep[attr] || [];
                    toKeep.forEach(nestedAttr => {
                        if (originalValue.hasOwnProperty(nestedAttr)) {
                            taskAttributes[attr] = taskAttributes[attr] || {};
                            taskAttributes[attr][nestedAttr] = originalValue[nestedAttr];
                        }
                    })
                }
            });
  
            // Convert the modified object back to a string
            body[0].data.payload.task_attributes = JSON.stringify(taskAttributes);
  
        } catch (error) {
            console.error("Error parsing task_attributes:", error);
        }
    }
  
    // Return the updated body
    return body;
  }
  