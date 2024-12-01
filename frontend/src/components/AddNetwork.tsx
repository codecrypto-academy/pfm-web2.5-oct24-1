import React from 'react';
import { Network } from '../../../backend/src/types/network';
import { useForm, SubmitHandler, useFieldArray} from 'react-hook-form';

export const AddNetwork: React.FC = () => {
    const { register, handleSubmit, control, formState: { errors }, setError, watch} = useForm<Network>();
    const onSubmit: SubmitHandler<Network> = async  data =>{
        // convert chainId to number
        data.chainId = data.chainId ? Number(data.chainId) : 0 

        // convert each alloc entry's value into number
        data.alloc = data.alloc.map(allocEntry => ({
            ...allocEntry,
            value: allocEntry.value ? Number(allocEntry.value) :0
        }) )

        // convert each node's port int number
        data.nodes = data.nodes.map(nodeEntry => ({
            ...nodeEntry,
            port: nodeEntry.port !== null ? Number(nodeEntry.port) : null // Convert port to number if not null
        }));

        console.log(data)

        if (data.alloc.length === 0 || data.nodes.length === 0) {
            // Si no hay elementos en alguno de los arreglos, establecemos un error
            setError("alloc", { type: "manual", message: "At least one alloc entry is required." });
            setError("nodes", { type: "manual", message: "At least one node entry is required." });
            return; // Detenemos el submit
        }
        try {
            const response = await fetch('http://localhost:3000/network/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data), // Enviamos los datos como JSON
            });
        
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
        
            const result = await response.json(); // Aquí puedes procesar la respuesta si es necesario
            console.log('Network created successfully:', result);
            // Aquí podrías redirigir o actualizar la UI después de la respuesta exitosa
          } catch (error) {
            console.error('Error creating network:', error);
          }
    }

    const { fields: allocFields, append: addAlloc } = useFieldArray({ control, name: "alloc" });
    const { fields: nodeFields, append: addNode } = useFieldArray({ control, name: "nodes" });


    return <div className="mb-2">
        <h3  className="text-start mb-4">Add new network</h3>
        <form onSubmit={handleSubmit(onSubmit)}  className="p-4 shadow-lg rounded-3 bg-white">
            <div className="mb-3">
                <label htmlFor="">ID</label>
                <input {...register("id", { required: "ID is required" })} 
                type="text" placeholder="newNetworkId"  className={`form-control ${errors.id ? 'is-invalid' : ''}`}/>
                {errors.id && <p  className='text-danger'>{errors.id.message}</p>}
            </div>
            <div className="mb-3">
                <label htmlFor="">Chain ID</label>
                <input {...register("chainId",{required: "Chain ID is required"})} 
                type="number"  placeholder="1234456"  className={`form-control ${errors.chainId ? 'is-invalid' : ''}`}/>
                {errors.chainId && <p  className='text-danger'>{errors.chainId.message}</p>}
            </div>
            <div className="mb-3">
                <label htmlFor="">Subnet</label>
                <input {...register("subnet",{required: "Subnet is required" }) } 
                type="text"  placeholder='x.x.x.0/24'  className={`form-control ${errors.subnet ? 'is-invalid' : ''}`}/>
                {errors.subnet && <p  className='text-danger'>{errors.subnet.message}</p>}
            </div>
            <div className="mb-3">
                <label htmlFor="">IP Boot Node</label>
                <input {...register("ipBootNode",{required: "Ip Boot Node is required" }) }
                 type="text"  placeholder='x.x.x.10'  className={`form-control ${errors.ipBootNode ? 'is-invalid' : ''}`}/>
                {errors.ipBootNode && <p className='text-danger'>{errors.ipBootNode.message}</p>}
            </div>

            {/* Section Alloc*/}
            <div className='mb-4'>
                <h5>Allocations</h5>
                {allocFields.map((field,index)=>(
                    <div key={field.id} className='mb-2'>
                        <input type="text" {...register(`alloc.${index}.address`,{required:"Address is required"})} 
                        placeholder="0x3d32324..."
                        className={`form-control me-2 ${errors.alloc?.[index]?.address ? 'is-invalid' : ''}`}/>
                         <input type="number" {...register(`alloc.${index}.value`,{required:"Value is required"})} 
                        placeholder="100000"
                        className={`form-control me-2 ${errors.alloc?.[index]?.value ? 'is-invalid' : ''}`}/>
                    </div>                  
                ))}
                {errors.alloc && <p className="text-danger">{errors.alloc.message}</p>}
                <button type="button" className="btn btn-outline-secondary" onClick={()=>addAlloc({address:"",value:0})}>
                    Add Alloc
                </button>
            </div>

            {/* Section Nodes*/}
            <div className="mb-3">
                <h5>Nodes</h5>
                {nodeFields.map((field, index) => (
                <div key={field.id} className="mb-4">
                     <select
                        {...register(`nodes.${index}.type`, { required: "Type is required" })}
                        className={`form-control mb-1 ${errors.nodes?.[index]?.type ? 'is-invalid' : ''}`}
                        >
                        <option value="">Select Type</option>
                        <option value="miner">Miner</option>
                        <option value="rpc">RPC</option>
                        <option value="normal">Normal</option>
                    </select>
                    <input
                    {...register(`nodes.${index}.name`, { required: "Name is required" })}
                    placeholder="Name"
                    className={`form-control mb-1 ${errors.nodes?.[index]?.name ? 'is-invalid' : ''}`}
                    />
                    <input
                    {...register(`nodes.${index}.ip`, { required: "IP is required" })}
                    placeholder="0.0.0.0"
                    className={`form-control mb-1 ${errors.nodes?.[index]?.ip ? 'is-invalid' : ''}`}
                    />
                    {/* Conditionally render the port input if node type is rpc */}
                    {watch(`nodes.${index}.type`) == "rpc" && (
                        <input
                        type="number"
                        {...register(`nodes.${index}.port`)}
                        placeholder="1234 (Optional)"
                        className="form-control"
                        />
                    )}
                </div>
                ))}
                {errors.nodes && <p className="text-danger">{errors.nodes.message}</p>}
                <button type="button" className="btn btn-outline-secondary" onClick={() => addNode({ type: "", name: "", ip: "", port: null })}>
                Add Node
                </button>
            </div>
            <button className='btn btn-secondary' type="submit">Add Network</button>
        </form>
    </div>
}