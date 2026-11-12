"""CPU-only per-row signed INT4 quantization and nibble packing.
This is not a GPU server or validated LLM benchmark.
Run: python projects/flashserve_4bit.py
"""
import numpy as np

def pack_int4(weights):
    w=np.asarray(weights,dtype=np.float32)
    if w.ndim!=2 or not w.size:
        raise ValueError("Expected a nonempty 2-D weight matrix")
    scale=np.maximum(np.max(np.abs(w),axis=1)/7,1e-12)
    integers=np.clip(np.rint(w/scale[:,None]),-8,7).astype(np.int8)
    width=integers.shape[1]
    if width%2:
        integers=np.pad(integers,((0,0),(0,1)))
    unsigned=(integers.astype(np.int16)+8).astype(np.uint8)
    return unsigned[:,::2]|(unsigned[:,1::2]<<4),scale,width

def unpack_int4(packed,scale,width):
    result=np.empty((packed.shape[0],packed.shape[1]*2),dtype=np.float32)
    result[:,::2]=(packed&15).astype(np.int16)-8
    result[:,1::2]=((packed>>4)&15).astype(np.int16)-8
    return result[:,:width]*scale[:,None]

if __name__=="__main__":
    rng=np.random.default_rng(42)
    w=rng.normal(size=(512,769)).astype(np.float32)
    p,s,n=pack_int4(w)
    restored=unpack_int4(p,s,n)
    print({"fp32_bytes":w.nbytes,"int4_and_scales_bytes":p.nbytes+s.nbytes,
           "mean_absolute_error":float(np.mean(abs(w-restored))),
           "note":"Synthetic CPU quantization; not GPU throughput."})
